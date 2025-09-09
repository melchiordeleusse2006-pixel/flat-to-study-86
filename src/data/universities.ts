// University data for Milan
export interface University {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
}

export const MILAN_UNIVERSITIES: University[] = [
  {
    id: 'bocconi',
    name: 'Università Bocconi',
    shortName: 'Bocconi',
    lat: 45.4440,
    lng: 9.1948
  },
  {
    id: 'cattolica',
    name: 'Università Cattolica del Sacro Cuore',
    shortName: 'Cattolica',
    lat: 45.4742,
    lng: 9.1827
  },
  {
    id: 'statale',
    name: 'Università Statale di Milano',
    shortName: 'La Statale',
    lat: 45.4627,
    lng: 9.1900
  },
  {
    id: 'politecnico',
    name: 'Politecnico di Milano',
    shortName: 'Politecnico',
    lat: 45.4784,
    lng: 9.2277
  }
];