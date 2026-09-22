export interface ImageUploadFieldSeplagProps {
  readonly name?: string;
  readonly label?: string;
  readonly cols?: string;
  readonly fotoPreview?: string | null;
  readonly onFileSelect: (file: File) => void;
  readonly isView?: boolean;
  readonly visible?: boolean;
  readonly placeholderImage?: string;
  readonly buttonLabel?: string;
}
