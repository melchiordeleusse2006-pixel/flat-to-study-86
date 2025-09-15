-- Create a function to get all conversations for the owner dashboard
CREATE OR REPLACE FUNCTION public.get_all_conversations_for_owner()
RETURNS TABLE(
  listing_id uuid,
  listing_title text,
  listing_images jsonb,
  listing_rent_monthly_eur integer,
  listing_city text,
  listing_address_line text,
  agency_id uuid,
  agency_name text,
  agency_phone text,
  agency_email text,
  student_sender_id uuid,
  student_name text,
  last_message_id uuid,
  last_message_content text,
  last_message_created_at timestamp with time zone,
  message_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH conversation_data AS (
    SELECT 
      m.listing_id,
      m.sender_id as student_sender_id,
      m.sender_name as student_name,
      m.agency_id,
      COUNT(*) as message_count,
      MAX(m.created_at) as last_message_time,
      (ARRAY_AGG(m.id ORDER BY m.created_at DESC))[1] as last_message_id,
      (ARRAY_AGG(m.message ORDER BY m.created_at DESC))[1] as last_message_content,
      MAX(m.created_at) as last_message_created_at
    FROM messages m
    GROUP BY m.listing_id, m.sender_id, m.sender_name, m.agency_id
  )
  SELECT 
    cd.listing_id,
    l.title as listing_title,
    l.images as listing_images,
    l.rent_monthly_eur as listing_rent_monthly_eur,
    l.city as listing_city,
    l.address_line as listing_address_line,
    cd.agency_id,
    p.agency_name,
    p.phone as agency_phone,
    p.email as agency_email,
    cd.student_sender_id,
    cd.student_name,
    cd.last_message_id,
    cd.last_message_content,
    cd.last_message_created_at,
    cd.message_count
  FROM conversation_data cd
  LEFT JOIN listings l ON l.id = cd.listing_id
  LEFT JOIN profiles p ON p.id = cd.agency_id
  ORDER BY cd.last_message_created_at DESC;
$$;

-- Create a function to get all messages for a specific conversation
CREATE OR REPLACE FUNCTION public.get_conversation_messages_for_owner(
  p_listing_id uuid,
  p_student_sender_id uuid
)
RETURNS TABLE(
  id uuid,
  message text,
  sender_name text,
  sender_phone text,
  sender_university text,
  created_at timestamp with time zone,
  read_at timestamp with time zone,
  listing_id uuid,
  agency_id uuid,
  sender_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.id,
    m.message,
    m.sender_name,
    m.sender_phone,
    m.sender_university,
    m.created_at,
    m.read_at,
    m.listing_id,
    m.agency_id,
    m.sender_id
  FROM messages m
  WHERE m.listing_id = p_listing_id 
  AND (m.sender_id = p_student_sender_id OR m.agency_id IN (
    SELECT agency_id FROM messages WHERE listing_id = p_listing_id AND sender_id = p_student_sender_id LIMIT 1
  ))
  ORDER BY m.created_at ASC;
$$;