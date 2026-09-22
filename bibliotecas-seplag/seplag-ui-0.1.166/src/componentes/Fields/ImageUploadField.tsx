import { BotaoSeplag } from "@componentes/Botao";

import { ImageCropperSeplag } from "@componentes/ReactCrop";
import { Image } from "primereact/image";
import { useState } from "react";
import RotuloSeplag from "../Rotulo";
import type { ImageUploadFieldSeplagProps } from "./types";

export function ImageUploadFieldSeplag(props: Readonly<ImageUploadFieldSeplagProps>) {
  const {
    name,
    label = "Foto",
    cols = "12 2",
    fotoPreview,
    onFileSelect,
    isView = false,
    visible = true,
    placeholderImage = "https://cdn-icons-png.flaticon.com/512/18125/18125416.png",
    buttonLabel = "Alterar foto",
  } = props;

  const [cropperVisible, setCropperVisible] = useState(false);

  if (!visible) return null;

  const inputId = name ?? "foto";

  return (
    <RotuloSeplag nome={label} cols={cols} style={{ justifyItems: "center", textAlign: "center" }}>
      <div className="flex flex-column align-items-center">
        <Image
          src={fotoPreview ?? placeholderImage}
          alt={label}
          width="100"
          className="border-1 surface-border border-round"
          imageStyle={{ objectFit: "cover", borderRadius: "8px" }}
          data-testid={`${inputId}-preview`}
        />

        {!isView && (
          <>
            <BotaoSeplag
              label={buttonLabel}
              icon="pi pi-upload"
              type="button"
              className="p-button-sm mt-2"
              onClick={() => setCropperVisible(true)}
              data-testid={`${inputId}-upload-button`}
            />
            <ImageCropperSeplag
              visible={cropperVisible}
              onHide={() => setCropperVisible(false)}
              setFile={onFileSelect}
            />
          </>
        )}
      </div>
    </RotuloSeplag>
  );
}

export default ImageUploadFieldSeplag;
