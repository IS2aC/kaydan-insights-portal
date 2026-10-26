// Données d'exemple : la veille réelle n'est pas encore branchée.
export type DaoStatus = "disponible" | "partiel" | "a-recuperer";
export type OfferType = "AO" | "AMI" | "DP";

export interface Offer {
  id: string;
  title: string;
  ref?: string;
  buyer: string;
  country: string;
  sector: string;
  type: OfferType;
  source: string;
  deadline: string; // ISO date
  publishedAt: string;
  budget?: string;
  match: number; // 0-100 adéquation au profil entreprise
  dao: DaoStatus;
  summary: string;
  lots?: string[];
  requirements: string[];
  watched?: boolean;
}

export const TODAY = new Date("2026-10-26T00:00:00");

export function daysLeft(o: Offer) {
  return Math.round((new Date(o.deadline).getTime() - TODAY.getTime()) / 86400000);
}

export function formatShort(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const offers: Offer[] = [
  {
    id: "n10057840",
    title: "Acquisition de matériel informatique : ordinateurs de bureau, laptops, imprimantes, imprimantes 3D, kit de découpe laser",
    ref: "N10057840",
    buyer: "Ministère de l'Enseignement Technique",
    country: "Côte d'Ivoire",
    sector: "IT",
    type: "AO",
    source: "SIGOMAP",
    deadline: "2026-10-27",
    publishedAt: "2026-10-06",
    budget: "≈ 180 M FCFA",
    match: 88,
    dao: "disponible",
    summary: "Fourniture en 3 lots de postes de travail, périphériques d'impression et équipements de fabrication numérique pour 12 lycées techniques.",
    lots: ["Lot 1 — Postes et laptops", "Lot 2 — Impression et 3D", "Lot 3 — Découpe laser"],
    requirements: ["Caution de soumission 2 %", "Agrément revendeur constructeur", "2 marchés similaires sur 3 ans"],
  },
  {
    id: "waho-gb",
    title: "Services de connectivité internet et de téléphonie pour le bureau WAHO de Grand-Bassam",
    ref: "WAHO/2026/ICT-14",
    buyer: "WAHO — Organisation Ouest Africaine de la Santé",
    country: "Côte d'Ivoire",
    sector: "IT",
    type: "AO",
    source: "UNGM",
    deadline: "2026-10-29",
    publishedAt: "2026-10-09",
    budget: "≈ 45 000 USD / an",
    match: 81,
    dao: "disponible",
    summary: "Contrat de 3 ans : liaison fibre dédiée, secours 4G, téléphonie IP et support sur site sous 4 h.",
    requirements: ["Licence ARTCI", "SLA 99,5 %", "Offre en anglais ou français"],
  },
  {
    id: "fmi-2026",
    title: "Fourniture de matériel informatique",
    buyer: "Mairie de Yamoussoukro",
    country: "Côte d'Ivoire",
    sector: "IT",
    type: "AO",
    source: "Journal Fraternité Matin",
    deadline: "2026-10-29",
    publishedAt: "2026-10-15",
    match: 54,
    dao: "a-recuperer",
    summary: "Avis succinct sans détail des quantités. Le DAO est à retirer en version papier auprès de la direction des marchés.",
    requirements: ["Retrait du DAO contre 50 000 FCFA"],
  },
  {
    id: "emsp",
    title: "Fourniture et installation de matériels et équipements informatiques pour l'École Multinationale Supérieure des Postes",
    buyer: "EMSP Abidjan",
    country: "Côte d'Ivoire",
    sector: "IT",
    type: "AO",
    source: "SIGOMAP",
    deadline: "2026-10-30",
    publishedAt: "2026-10-02",
    budget: "≈ 95 M FCFA",
    match: 76,
    dao: "partiel",
    summary: "Équipement de 4 salles informatiques et d'un datacenter de proximité, installation et formation des utilisateurs incluses.",
    requirements: ["Visite de site obligatoire le 28/10", "Certification réseau exigée"],
  },
  {
    id: "tcis-pentest",
    title: "Recrutement d'un cabinet de services en cybersécurité — tests d'intrusion et de sécurité",
    ref: "EOI-TCIS-031",
    buyer: "TCIS",
    country: "Sénégal",
    sector: "IT",
    type: "AMI",
    source: "Banque mondiale",
    deadline: "2026-10-30",
    publishedAt: "2026-10-10",
    match: 92,
    dao: "disponible",
    summary: "Manifestation d'intérêt pour une mission de 18 mois : tests d'intrusion applicatifs et infrastructure, plan de remédiation.",
    requirements: ["Références pentest secteur public", "CV d'experts OSCP / CISSP", "Méthode de sélection SFQC"],
  },
  {
    id: "tcis-analysts",
    title: "Recrutement de deux analystes juniors en support opérationnel cybersécurité",
    ref: "EOI-TCIS-032",
    buyer: "TCIS",
    country: "Sénégal",
    sector: "IT",
    type: "AMI",
    source: "Banque mondiale",
    deadline: "2026-10-31",
    publishedAt: "2026-10-10",
    match: 63,
    dao: "disponible",
    summary: "Mise à disposition de deux profils SOC niveau 1 pour 12 mois, encadrement par le RSSI client.",
    requirements: ["CV nominatifs", "Disponibilité immédiate"],
  },
  {
    id: "anstat-erp",
    title: "Mise en place d'un ERP de gestion financière et comptable",
    ref: "ANStat/DP/2026/07",
    buyer: "ANStat",
    country: "Côte d'Ivoire",
    sector: "IT",
    type: "DP",
    source: "SIGOMAP",
    deadline: "2026-11-04",
    publishedAt: "2026-10-12",
    budget: "≈ 320 M FCFA",
    match: 85,
    dao: "disponible",
    summary: "Intégration d'un ERP (finance, comptabilité, budget) avec reprise de données sur 5 ans et formation de 60 utilisateurs.",
    requirements: ["Partenariat éditeur", "Chef de projet certifié PMP", "3 références ERP secteur public"],
  },
  {
    id: "bad-datacenter",
    title: "Modernisation du datacenter et plan de reprise d'activité",
    buyer: "Banque Africaine de Développement",
    country: "Côte d'Ivoire",
    sector: "IT",
    type: "AO",
    source: "AfDB e-Procurement",
    deadline: "2026-11-08",
    publishedAt: "2026-10-01",
    budget: "≈ 1,2 M USD",
    match: 71,
    dao: "partiel",
    summary: "Refonte de l'infrastructure de virtualisation, stockage et sauvegarde, avec site de secours et tests PRA semestriels.",
    requirements: ["Chiffre d'affaires ≥ 2 M USD", "Groupement autorisé"],
  },
  {
    id: "cie-sig",
    title: "Développement d'un système d'information géographique du réseau électrique",
    buyer: "CIE",
    country: "Côte d'Ivoire",
    sector: "Énergie",
    type: "AO",
    source: "Site acheteur",
    deadline: "2026-11-15",
    publishedAt: "2026-10-18",
    match: 68,
    dao: "a-recuperer",
    summary: "Cartographie numérique du réseau HTA/BT, application mobile de relevé terrain et tableau de bord d'exploitation.",
    requirements: ["Expérience SIG réseau", "Équipe locale"],
  },
  {
    id: "minsante-telemed",
    title: "Plateforme de télémédecine pour 40 centres de santé ruraux",
    buyer: "Ministère de la Santé",
    country: "Burkina Faso",
    sector: "Santé",
    type: "AMI",
    source: "UNGM",
    deadline: "2026-11-21",
    publishedAt: "2026-10-20",
    match: 59,
    dao: "disponible",
    summary: "Conception, déploiement et maintenance d'une solution de téléconsultation avec équipements connectés.",
    requirements: ["Hébergement agréé données de santé"],
  },
];

export const daoLabel: Record<DaoStatus, string> = {
  disponible: "DAO disponible",
  partiel: "DAO partiel",
  "a-recuperer": "DAO à récupérer",
};
