export interface LigneCommande {
  id:    number;
  prix:  number;
  car?: {
    id:     number;
    nom:    string;
    marque: string;
    annee:  number;
    images?: { chemin: string; is_primary: boolean }[];
  };
}

export interface Commande {
  id:              number;
  montant_total:   number;
  status:          string;
  created_at:      string;
  user?: {
    id:        number;
    firstName: string;
    lastName:  string;
    email:     string;
    phone?:    string;
  };
  ligne_commandes: LigneCommande[];
}