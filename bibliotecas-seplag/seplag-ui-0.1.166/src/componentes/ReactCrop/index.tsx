import "cropperjs/dist/cropper.css";
import { Dialog } from "primereact/dialog";
import type { FileUploadSelectEvent } from "primereact/fileupload";
import { FileUpload } from "primereact/fileupload";
import { useRef, useState } from "react";
import type { ReactCropperElement } from "react-cropper";
import Cropper from "react-cropper";
import { useToastSeplag } from "../../hooks/toast";
import { BotaoSeplag } from "../Botao";

function adjustCanvasSize(canvas: HTMLCanvasElement) {
  const MAX_WIDTH = 900;
  const MAX_HEIGHT = 700;
  let width = 400;
  let height = 300;

  if (width > height && width > MAX_WIDTH) {
    height *= MAX_WIDTH / width;
    width = MAX_WIDTH;
  } else if (height >= width && height > MAX_HEIGHT) {
    width *= MAX_HEIGHT / height;
    height = MAX_HEIGHT;
  }

  if (canvas.width > MAX_WIDTH && canvas.height > MAX_HEIGHT) {
    canvas.width = width;
    canvas.height = height;
  }
}

interface ImageCropperSeplagProps {
  visible: boolean;
  onHide: () => void;
  setFile: (file: File) => void;
}

export const ImageCropperSeplag = ({ visible, onHide, setFile }: ImageCropperSeplagProps) => {
  const [imgSrc, setImgSrc] = useState<string | null>("");
  const { printToast } = useToastSeplag();
  const cropperRef = useRef<ReactCropperElement>(null);

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas();
    adjustCanvasSize(canvas);

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(canvas, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "name", {
          type: blob.type,
        });
        setFile(file);
        onHide();
        setImgSrc(null);
      }
    });
  };

  const onUploadFoto = (e: FileUploadSelectEvent) => {
    if (e.files && e.files.length > 0) {
      if (e.files[0].size > 2000000) {
        printToast({
          severity: "error",
          summary: "Erro ao enviar o arquivo",
          detail: "O tamanho do arquivo excede 2 MBs, por favor informe um arquivo com até 2 MBs.",
          life: 5000,
        });
      } else {
        const file = e.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target) {
            setImgSrc(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <Dialog
      id="image-cropper-modal"
      data-testid="image-cropper-modal"
      header="Foto"
      visible={visible}
      onHide={onHide}
      contentStyle={{ maxWidth: "200rem", maxHeight: "50rem" }}
    >
      <div className="col-12 ">
        {imgSrc ? (
          <div className="flex flex-column gap-2">
            <Cropper
              src={imgSrc}
              style={{ height: 600, width: 800 }}
              aspectRatio={3 / 4}
              autoCropArea={0.5}
              rotatable={false}
              background={true}
              dragMode="crop"
              viewMode={2}
              minContainerWidth={250}
              minContainerHeight={180}
              guides={true}
              ref={cropperRef}
            />
            <BotaoSeplag
              id="image-cropper-cortar"
              data-testid="image-cropper-cortar"
              onClick={onCrop}
              label="Cortar Imagem"
            />
          </div>
        ) : (
          <FileUpload
            id="image-cropper-upload"
            data-testid="image-cropper-upload"
            customUpload={true}
            mode="basic"
            chooseLabel="Selecionar Imagem (JPEG e PNG de até 2 MB)"
            invalidFileSizeMessageDetail="Tamanho Máximo do Arquivo Não Permitido. Tamanho Máximo de {1}."
            accept="image/*"
            onSelect={onUploadFoto}
            maxFileSize={2000000}
          />
        )}
      </div>
    </Dialog>
  );
};
