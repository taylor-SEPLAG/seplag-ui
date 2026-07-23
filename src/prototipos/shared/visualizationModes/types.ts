export type ReviewStatus = "PENDENTE" | "APROVADO" | "RESSALVA" | "AJUSTE" | "DUVIDA";

export interface ReviewUser {
  id: string;
  email: string;
  name: string;
  role: "REVIEWER" | "ADMIN";
}

export interface PrototypeReview {
  id: string;
  prototypeId: string;
  prototypeVersion: string;
  screenId: string;
  componentId: string;
  componentTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  status: ReviewStatus;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewInput {
  prototypeId: string;
  prototypeVersion: string;
  screenId: string;
  componentId: string;
  componentTitle: string;
  status: ReviewStatus;
  comment: string;
}
