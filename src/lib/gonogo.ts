// Données d'exemple : l'agent d'analyse Go/NoGo n'est pas encore branché.
export type Verdict = "go" | "arbitrer" | "nogo";
export type ReqStatus = "verifiee" | "a-verifier" | "non-trouvee";

export const verdictMeta: Record<Verdict, { label: string; short: string; cls: string }> = {
  go: { label: "Go recommandé", short: "Favorable", cls: "bg-success/10 text-success" },
  arbitrer: { label: "À arbitrer", short: "Réservé", cls: "bg-accent/10 text-accent-strong" },
  nogo: { label: "NoGo recommandé", short: "Défavorable", cls: "bg-destructive/10 text-destructive" },
};

/** Seuils du verdict recommandé à partir de l'indice théorique (0-100). */
export function verdictFor(index: number): Verdict {
  if (index >= 70) return "go";
  if (index >= 50) return "arbitrer";
  return "nogo";
}

export interface Lever {
  code: "S1" | "S2" | "S3" | "S4";
  name: string;
  short: string;
  weight: number;
  score: number; // 0-1
  reqs: number;
  sheets: number;
  formula: string;
  measures: { label: string; value: string; note: string }[];
  favor: Match[];
  penal: Match[];
}
export interface Match { ref: string; title: string; elim?: boolean; score: number; source: string; sim: number }

/** Indice = somme(poids × score) / somme des poids, ramené sur 100. */
export function computeIndex(levers: Pick<Lever, "weight" | "score">[]) {
  const w = levers.reduce((a, l) => a + l.weight, 0);
  if (!w) return 0;
  return Math.round((levers.reduce((a, l) => a + l.weight * l.score, 0) / w) * 100);
}

export const STEPS = ["Extraction", "Contrôle qualité", "Indexation sémantique", "Analyse IA", "Vérification & rapport", "Synthèse Go/NoGo"];

const FILE = "PARAE_Additif n°1 au DAO_Acquisition d'équipements du site du lab IA et de big data_vfpub.pdf";

export interface Analysis {
  id: string;
  title: string;
  ref: string;
  buyer: string;
  type: "AO" | "AMI";
  createdAt: string;
  deadline: string;
  status: "termine" | "en-cours" | "attente";
  step: number; // index de l'étape courante (0-5), 6 = terminé
  duration?: string;
  scope: string[];
  report?: Report;
}

export interface Report {
  id: string;
  model: string;
  hash: string;
  pages: number;
  lots: string[];
  closed: string;
  counts: { reqs: number; verified: number; toCheck: number; elim: number; mandatory: number; attention: number; anomalies: number; citations: [number, number] };
  scope: { label: string; count: number }[];
  critical: { type: string; text: string; action: string; page: number }[];
  keyInfo: { label: string; items: { lot?: string; value: string; ref: string; page: number; check?: boolean }[]; more?: number }[];
  elim: { ref: string; title: string; desc: string; lot: string; value: string; page: number; status: ReqStatus }[];
  reqs: { ref: string; title: string; cat: string; sub: string; lot: string; value: string; status: ReqStatus; elim?: boolean; excerpt: string; page: number }[];
  anomalies: { type: string; ref?: string; reqTitle: string; constat: string; excerpt?: string; page: number }[];
  strengths: string;
  files: { name: string; size: string; pages: number; kind: string; sha: string; errors: number }[];
  levers: Lever[];
  vigilance: { ref?: string; text: string }[];
  llm: { score: number; text: string; pros: string[]; cons: string[] };
  docs: { name: string; until?: string; ok: boolean }[];
}

const parae: Report = {
  id: "F571DC96",
  model: "qwen3-27b · analyste-1.3",
  hash: "e986b2…6d2d",
  pages: 104,
  lots: ["Lot 1 — Infrastructure Cloud / Big Data / HPC", "Lot 2 — Stations de travail et postes IA"],
  closed: "2026-11-12T10:00",
  counts: { reqs: 160, verified: 139, toCheck: 21, elim: 19, mandatory: 34, attention: 2, anomalies: 25, citations: [184, 205] },
  scope: [
    { label: "Infrastructure", count: 29 }, { label: "Réseau & télécom", count: 23 }, { label: "IA", count: 14 },
    { label: "HPC", count: 13 }, { label: "Logiciel", count: 12 }, { label: "Cloud", count: 12 },
    { label: "Conseil & formation", count: 12 }, { label: "Data", count: 8 }, { label: "Cybersécurité", count: 8 },
  ],
  critical: [
    { type: "Incohérence chiffres / lettres", text: "« Sept cent cinquante mille » (750 000) écrit (7 000 000) en chiffres", action: "Clarification acheteur urgente", page: 9 },
    { type: "Incohérence chiffres / lettres", text: "« trente » (30) écrit (50) en chiffres", action: "Clarification acheteur urgente", page: 67 },
  ],
  keyInfo: [
    { label: "Date et heure limites de dépôt", items: [{ value: "12/11/2026 à 10:00", ref: "EX-022", page: 10 }] },
    { label: "Validité des offres", items: [{ value: "120 jours calendaires", ref: "EX-021", page: 9 }] },
    { label: "Garantie de soumission", items: [{ lot: "Lot 1", value: "20 000 000 XOF", ref: "EX-018", page: 9 }, { lot: "Lot 2", value: "7 000 000 XOF", ref: "EX-019", page: 9, check: true }], more: 1 },
    { label: "Règle d'attribution", items: [{ value: "Moins-disant conforme", ref: "EX-027", page: 11, check: true }] },
    { label: "Chiffre d'affaires minimum", items: [{ lot: "Lot 1", value: "1 700 000 000 XOF", ref: "EX-036", page: 18 }, { lot: "Lot 2", value: "500 000 000 XOF", ref: "EX-037", page: 18 }] },
    { label: "Garantie de bonne exécution", items: [{ value: "12 mois", ref: "EX-024", page: 15 }, { lot: "Lot 2", value: "3 ans", ref: "EX-137", page: 88, check: true }] },
    { label: "Délai d'exécution", items: [{ lot: "Lot 1", value: "180 jours calendaires", ref: "EX-003", page: 5 }, { lot: "Lot 2", value: "180 jours calendaires", ref: "EX-004", page: 5 }] },
    { label: "Allotissement", items: [{ value: "Deux lots, soumission possible aux deux", ref: "EX-002", page: 2 }] },
    { label: "Monnaie de l'offre", items: [{ value: "FCFA et devises (max 3)", ref: "EX-007", page: 8 }] },
    { label: "Source de financement", items: [{ value: "Prêt BAD n° 2000200006057", ref: "EX-001", page: 1 }] },
    { label: "Visite / réunion préparatoire", items: [{ value: "29/10/2026 à 10:00", ref: "EX-005", page: 3 }] },
    { label: "Mode de passation", items: [] },
  ],
  elim: [
    { ref: "EX-003", title: "Délai d'exécution Lot 1", desc: "Le délai d'exécution pour le Lot 1 est de 180 jours calendaires.", lot: "Lot 1", value: "180 jours calendaires", page: 5, status: "verifiee" },
    { ref: "EX-004", title: "Délai d'exécution Lot 2", desc: "Le délai d'exécution pour le Lot 2 est de 180 jours calendaires.", lot: "Lot 2", value: "180 jours calendaires", page: 5, status: "verifiee" },
    { ref: "EX-018", title: "Garantie de soumission Lot 1", desc: "Garantie de 20 000 000 FCFA fournie selon le modèle joint au DAO.", lot: "Lot 1", value: "20 000 000 XOF", page: 9, status: "verifiee" },
    { ref: "EX-019", title: "Garantie de soumission Lot 2", desc: "Garantie de 7 000 000 FCFA fournie selon le modèle joint au DAO.", lot: "Lot 2", value: "7 000 000 XOF", page: 9, status: "a-verifier" },
    { ref: "EX-020", title: "Validité de la garantie de soumission", desc: "Ne doit pas expirer avant 28 jours après la fin de validité des offres.", lot: "Tous", value: "148 jours", page: 9, status: "verifiee" },
    { ref: "EX-024", title: "Garantie de bon fonctionnement et support", desc: "L'attributaire assure garantie et support sur site pendant 12 mois.", lot: "Tous", value: "12 mois", page: 15, status: "verifiee" },
    { ref: "EX-025", title: "Qualification de l'équipe clé", desc: "Qualification et expérience de l'équipe clé : critère d'élimination.", lot: "Tous", value: "Critère technique", page: 11, status: "a-verifier" },
    { ref: "EX-026", title: "Expérience en marchés similaires", desc: "Au moins 2 marchés similaires sur les 5 dernières années.", lot: "Tous", value: "2 marchés / 5 ans", page: 18, status: "verifiee" },
    { ref: "EX-036", title: "Chiffre d'affaires annuel moyen Lot 1", desc: "CA moyen des 3 derniers exercices au moins égal au seuil.", lot: "Lot 1", value: "1 700 000 000 XOF", page: 18, status: "verifiee" },
    { ref: "EX-037", title: "Chiffre d'affaires annuel moyen Lot 2", desc: "CA moyen des 3 derniers exercices au moins égal au seuil.", lot: "Lot 2", value: "500 000 000 XOF", page: 18, status: "verifiee" },
    { ref: "EX-038", title: "Capacité de financement Lot 1", desc: "Accès à des liquidités ou facilités de crédit suffisantes.", lot: "Lot 1", value: "450 000 000 XOF", page: 19, status: "verifiee" },
    { ref: "EX-041", title: "Expérience spécifique Lot 1", desc: "Un marché d'infrastructure Cloud / HPC d'au moins 1 Md XOF.", lot: "Lot 1", value: "1 marché ≥ 1 Md XOF", page: 19, status: "verifiee" },
    { ref: "EX-042", title: "Expérience spécifique Lot 2", desc: "Un marché de fourniture de postes de travail d'au moins 300 M XOF.", lot: "Lot 2", value: "1 marché ≥ 300 M XOF", page: 19, status: "verifiee" },
  ],
  reqs: [
    { ref: "EX-001", title: "Source de financement", cat: "Exigences financières", sub: "Source de financement", lot: "Tous", value: "Prêt BAD n° 2000200006057", status: "verifiee", excerpt: "Le Gouvernement a obtenu un prêt de la Banque Africaine de Développement…", page: 1 },
    { ref: "EX-002", title: "Allotissement du marché", cat: "Exigences techniques", sub: "Lots et possibilité de soumissionner à plusieurs lots", lot: "Tous", value: "Deux (2) lots", status: "verifiee", excerpt: "Le marché est constitué de deux (2) lots : Lot 1 et Lot 2…", page: 2 },
    { ref: "EX-003", title: "Délai d'exécution Lot 1", cat: "Délais et dates", sub: "Délai d'exécution ou de livraison", lot: "Lot 1", value: "180 jours calendaires", status: "verifiee", elim: true, excerpt: "Le délai d'exécution du Lot 1 est de cent quatre-vingts (180) jours…", page: 5 },
    { ref: "EX-004", title: "Délai d'exécution Lot 2", cat: "Délais et dates", sub: "Délai d'exécution ou de livraison", lot: "Lot 2", value: "180 jours calendaires", status: "verifiee", elim: true, excerpt: "Le délai d'exécution du Lot 2 est de cent quatre-vingts (180) jours…", page: 5 },
    { ref: "EX-005", title: "Réunion préparatoire", cat: "Pièces administratives", sub: "Visite de site ou réunion préparatoire", lot: "Tous", value: "29/10/2026 à 10:00", status: "verifiee", excerpt: "Une réunion préparatoire se tiendra le 29 octobre 2026 à 10 heures…", page: 3 },
    { ref: "EX-006", title: "Langue de l'offre", cat: "Pièces administratives", sub: "Langue de l'offre", lot: "Tous", value: "Français", status: "verifiee", excerpt: "L'offre ainsi que toute correspondance seront rédigées en français.", page: 8 },
    { ref: "EX-007", title: "Monnaies de l'offre", cat: "Exigences financières", sub: "Monnaie de l'offre", lot: "Tous", value: "FCFA et devises (max 3)", status: "verifiee", excerpt: "Le soumissionnaire peut libeller son prix en FCFA et en trois devises au plus…", page: 8 },
    { ref: "EX-008", title: "Incoterms et lieu de livraison", cat: "Exigences techniques", sub: "Livraison", lot: "Tous", value: "CIP Abidjan", status: "verifiee", excerpt: "Livraison CIP site du lab IA, Abidjan…", page: 8 },
    { ref: "EX-011", title: "Expérience en marchés similaires", cat: "Critères d'évaluation", sub: "Qualification", lot: "Tous", value: "2 marchés / 5 ans", status: "a-verifier", excerpt: "Extrait absent des blocs cités (similarité 0,89).", page: 7 },
    { ref: "EX-018", title: "Garantie de soumission Lot 1", cat: "Garanties", sub: "Garantie de soumission", lot: "Lot 1", value: "20 000 000 XOF", status: "verifiee", elim: true, excerpt: "La garantie de soumission doit être de 20 000 000 FCFA pour le Lot 1…", page: 9 },
    { ref: "EX-019", title: "Garantie de soumission Lot 2", cat: "Garanties", sub: "Garantie de soumission", lot: "Lot 2", value: "7 000 000 XOF", status: "a-verifier", elim: true, excerpt: "Sept cent cinquante mille (7 000 000) FCFA pour le Lot 2…", page: 9 },
    { ref: "EX-024", title: "Garantie de bon fonctionnement", cat: "Garanties", sub: "Garantie et support", lot: "Tous", value: "12 mois", status: "verifiee", elim: true, excerpt: "L'Attributaire doit offrir une garantie de bon fonctionnement de 12 mois…", page: 15 },
    { ref: "EX-130", title: "État de santé du cluster Ceph à la réception", cat: "Exigences techniques", sub: "Recette", lot: "Lot 1", value: "HEALTH_OK", status: "verifiee", excerpt: "Le cluster Ceph doit être en état HEALTH_OK lors de la réception…", page: 74 },
    { ref: "EX-135", title: "Abonnement annuel du pare-feu", cat: "Exigences techniques", sub: "Sécurité", lot: "Lot 1", value: "Non trouvée", status: "non-trouvee", excerpt: "La valeur annoncée n'apparaît dans aucun extrait cité.", page: 83 },
  ],
  anomalies: [
    { type: "Incohérence lettres / chiffres", reqTitle: "Dossier", constat: "« Sept cent cinquante mille » (750 000) écrit (7 000 000) en chiffres", excerpt: "La garantie de soumission doit être de sept cent cinquante mille (7 000 000) FCFA…", page: 9 },
    { type: "Incohérence lettres / chiffres", reqTitle: "Dossier", constat: "« trente » (30) écrit (50) en chiffres", excerpt: "sans dépasser trente (50) homme/jour par an…", page: 67 },
    { type: "Valeur absente de la citation", ref: "EX-135", reqTitle: "Abonnement annuel du pare-feu", constat: "La valeur annoncée n'apparaît en chiffres dans aucun extrait cité.", page: 83 },
    { type: "Valeur absente de la citation", ref: "EX-137", reqTitle: "Garantie constructeur stations de travail", constat: "La valeur annoncée n'apparaît en chiffres dans aucun extrait cité.", page: 88 },
    { type: "Citation introuvable", ref: "EX-011", reqTitle: "Expérience en marchés similaires", constat: "Extrait absent des blocs cités (similarité 0,89).", page: 7 },
    { type: "Citation approximative", ref: "EX-019", reqTitle: "Garantie de soumission Lot 2", constat: "Extrait reformulé, montant cohérent avec la page 9.", page: 9 },
    { type: "Citation dans un autre bloc", ref: "EX-027", reqTitle: "Règle d'attribution", constat: "Citation retrouvée dans le bloc voisin, page 11.", page: 11 },
  ],
  strengths: "Mettre en avant les références en infrastructure, réseau & télécom et IA, les certifications de l'équipe et la capacité d'intervention locale dans la zone UEMOA.",
  files: [{ name: FILE, size: "1,4 Mo", pages: 104, kind: "Additif", sha: "e1455bf7e636f6a7…", errors: 0 }],
  levers: [
    {
      code: "S1", name: "Expériences et qualifications", short: "Expériences", weight: 4, score: 0.497, reqs: 10, sheets: 5,
      formula: "moyenne(meilleure similarité normalisée × preuve) ; preuve = 1 (ABE), 0,5 (PV seul), 0 (aucune pièce)",
      measures: [{ label: "Rapprochement exigences / ABE", value: "0,50", note: "moyenne sur 10 exigences du score de la meilleure référence" }],
      favor: [
        { ref: "EX-041", title: "Expérience spécifique Lot 1", elim: true, score: 64, source: "Centre opérationnel de sécurité (SOC) et SIEM", sim: 0.54 },
        { ref: "EX-040", title: "Expérience générale marchés similaires", elim: true, score: 64, source: "Cluster de calcul haute performance (HPC)", sim: 0.54 },
        { ref: "EX-042", title: "Expérience spécifique Lot 2", elim: true, score: 60, source: "Centre opérationnel de sécurité (SOC) et SIEM", sim: 0.53 },
      ],
      penal: [
        { ref: "EX-026", title: "Expérience en marchés similaires", elim: true, score: 39, source: "Centre opérationnel de sécurité (SOC) et SIEM", sim: 0.47 },
        { ref: "EX-089", title: "Expérience spécifique requise", score: 36, source: "Centre opérationnel de sécurité (SOC) et SIEM", sim: 0.46 },
        { ref: "EX-090", title: "Expérience dans les activités principales", score: 35, source: "Centre opérationnel de sécurité (SOC) et SIEM", sim: 0.46 },
      ],
    },
    {
      code: "S2", name: "Savoir-faire technique", short: "Savoir-faire", weight: 3, score: 0.607, reqs: 85, sheets: 33,
      formula: "moyenne(meilleure similarité normalisée) entre exigences techniques et CV, missions, technologies, certifications",
      measures: [{ label: "Rapprochement exigences techniques / savoir-faire", value: "0,61", note: "moyenne sur 85 exigences" }],
      favor: [
        { ref: "EX-043", title: "Chef de projet", score: 100, source: "Aïcha Koné", sim: 0.66 },
        { ref: "EX-056", title: "Chef de projet (poste 1)", score: 100, source: "Chef de projet infrastructures — Aïcha Koné", sim: 0.65 },
        { ref: "EX-096", title: "Support à distance", score: 100, source: "Support et maintenance", sim: 0.67 },
      ],
      penal: [
        { ref: "EX-130", title: "État de santé du cluster Ceph à la réception", score: 23, source: "Centre opérationnel de sécurité (SOC) et SIEM", sim: 0.42 },
        { ref: "EX-092", title: "Marchés en cours", score: 27, source: "ISO/IEC 27001:2022", sim: 0.43 },
        { ref: "EX-033", title: "Offres variantes", score: 28, source: "Partenaire constructeur", sim: 0.44 },
      ],
    },
    {
      code: "S3", name: "Capacités financières", short: "Finance", weight: 2, score: 0.643, reqs: 24, sheets: 8,
      formula: "moyenne(rapprochement financier, jugement du modèle)",
      measures: [
        { label: "Rapprochement exigences financières / états financiers", value: "0,69", note: "moyenne sur 24 exigences" },
        { label: "Jugement du modèle (aptitude à porter l'offre)", value: "0,60", note: "note de 0 à 1" },
      ],
      favor: [
        { ref: "EX-036", title: "Chiffre d'affaires annuel moyen Lot 1", elim: true, score: 100, source: "Exercice 2025", sim: 0.66 },
        { ref: "EX-037", title: "Chiffre d'affaires annuel moyen Lot 2", elim: true, score: 100, source: "Exercice 2025", sim: 0.66 },
        { ref: "EX-038", title: "Capacité de financement Lot 1", elim: true, score: 100, source: "Financement et garanties", sim: 0.74 },
      ],
      penal: [
        { ref: "EX-068", title: "Garantie de bonne exécution", score: 35, source: "Financement et garanties", sim: 0.45 },
        { ref: "EX-024", title: "Garantie de bon fonctionnement et support", elim: true, score: 41, source: "Litiges et antécédents", sim: 0.47 },
        { ref: "EX-137", title: "Garantie constructeur stations de travail", score: 45, source: "Financement et garanties", sim: 0.49 },
      ],
    },
    {
      code: "S4", name: "Documents administratifs", short: "Administratif", weight: 1, score: 0.75, reqs: 20, sheets: 14,
      formula: "moyenne(rapprochement administratif, pièces valides / pièces au total)",
      measures: [
        { label: "Rapprochement exigences administratives / pièces", value: "0,59", note: "moyenne sur 20 exigences" },
        { label: "Validité des pièces", value: "0,91", note: "10 pièces valides sur 11 à la date limite" },
      ],
      favor: [
        { ref: "EX-014", title: "Attestation bancaire", score: 100, source: "Attestation bancaire", sim: 0.7 },
        { ref: "EX-015", title: "Attestation de non-faillite", score: 100, source: "Attestation de non-faillite", sim: 0.72 },
        { ref: "EX-016", title: "Redevance de régulation ARCOP", score: 100, source: "Attestation ARCOP", sim: 0.72 },
      ],
      penal: [
        { ref: "EX-105", title: "Compétence juridictionnelle en cas de litige", score: 27, source: "Statuts de la société", sim: 0.43 },
        { ref: "EX-106", title: "Charge des frais d'enregistrement", score: 27, source: "Statuts de la société", sim: 0.43 },
        { ref: "EX-029", title: "Autorisation du fabricant", score: 30, source: "Agrément intégrateur sécurité numérique", sim: 0.44 },
      ],
    },
  ],
  vigilance: [
    { ref: "EX-026", text: "Éliminatoire peu couvert par le profil : expérience en marchés similaires (score 39)" },
    { text: "Pièce non valide à la date limite : casier judiciaire du dirigeant (expiré le 12/09/2026)" },
  ],
  llm: {
    score: 0.6,
    text: "Le CA moyen sur 3 ans (1,54 Md XOF) reste sous le seuil du Lot 1 (1,7 Md XOF), même si le CA 2025 le dépasse. La capacité de financement et la trésorerie couvrent en revanche le préfinancement et les cautions des deux lots.",
    pros: ["Capacité de financement : 450 M XOF disponibles pour 450 M exigés (Lot 1) et 150 M (Lot 2)", "Trésorerie de 193 M XOF et fonds propres de 949 M XOF en 2025", "Aucun litige ni défaut d'exécution déclaré"],
    cons: ["CA moyen inférieur au seuil du Lot 1", "Risque de rejet du Lot 1 si le CA moyen est appliqué strictement"],
  },
  docs: [
    { name: "Déclaration fiscale d'existence (DFE)", ok: true },
    { name: "Attestation de régularité fiscale", until: "05/01/2027", ok: true },
    { name: "Registre du commerce (RCCM)", ok: true },
    { name: "Attestation de régularité sociale (CNPS)", until: "01/12/2026", ok: true },
    { name: "Attestation de non-faillite", until: "20/12/2026", ok: true },
    { name: "Attestation bancaire", until: "15/03/2027", ok: true },
    { name: "Redevance de régulation (ARCOP)", until: "31/12/2026", ok: true },
    { name: "Certificat de non-exclusion de la commande publique", until: "01/02/2027", ok: true },
    { name: "Casier judiciaire du dirigeant", until: "12/09/2026", ok: false },
    { name: "Statuts de la société", ok: true },
    { name: "Pouvoir du signataire de l'offre", until: "31/08/2027", ok: true },
  ],
};

export const analyses: Analysis[] = [
  {
    id: "parae-lab-ia", title: "Acquisition d'équipements du site du lab IA et de big data", ref: "PARAE/AOI/2026/04",
    buyer: "Projet PARAE — Ministère de l'Économie numérique", type: "AO", createdAt: "2026-10-24T17:15", deadline: "2026-11-12",
    status: "termine", step: 6, duration: "22 min 25", scope: ["Infrastructure", "Réseau & télécom", "IA"], report: parae,
  },
  {
    id: "anstat-erp", title: "Mise en place d'un ERP de gestion financière et comptable", ref: "ANStat/DP/2026/07",
    buyer: "ANStat", type: "AO", createdAt: "2026-10-26T19:58", deadline: "2026-11-04",
    status: "en-cours", step: 3, scope: ["Logiciel", "Conseil & formation"],
  },
  {
    id: "tcis-pentest", title: "Recrutement d'un cabinet en cybersécurité — tests d'intrusion", ref: "EOI-TCIS-031",
    buyer: "TCIS", type: "AMI", createdAt: "2026-10-26T20:05", deadline: "2026-10-30",
    status: "attente", step: 0, scope: ["Cybersécurité"],
  },
];

export function analysisIndex(a: Analysis) {
  return a.report ? computeIndex(a.report.levers) : undefined;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return { date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`, time: `${p(d.getHours())}:${p(d.getMinutes())}` };
}

export const PDF_NAME = FILE;
