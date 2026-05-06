import { Categorie } from "./categorie";

export class Car {
    id!: number;
    nom!:string;
  category_id!: number;
  marque!: string;
  model!: string;
  annee!: number;
  prix!: number;
  kilometrage!: string;
  carburant!: string;
  transmission!: string;
  couleur!: string;
  description?: string;
  status?: string;
  categorie?: Categorie;
  images!:Image[];
}

export class Image{

  id!: number;
  chemin!: string;
  isPrimary?: boolean;
  altText?: string;
  dateCreation?: Date;
}
