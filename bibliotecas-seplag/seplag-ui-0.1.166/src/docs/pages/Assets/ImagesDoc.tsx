import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import "primereact/resources/themes/saga-blue/theme.css";

import apoioSti from "../../../assets/img/apoio-sti.png";
import defaultAvatar from "../../../assets/img/default-avatar.jpg";
import favicon from "../../../assets/img/favicon.png";
import fotoDefault from "../../../assets/img/fotoDefault.jpg";
import logoSeplagT from "../../../assets/img/LOGO SEPLAG - AZUL (T) VAZADO.svg";
import logoSeplagWhite from "../../../assets/img/LOGO SEPLAG - BRANCO VAZADO.svg";
import logoSeplagPng from "../../../assets/img/logo-seplag.png";
import logoBranco from "../../../assets/img/Logo_Branco_Estado_MT.png";
import manopla from "../../../assets/img/manopla.jpg";
import mtLogin from "../../../assets/img/mt-login.png";
import page404 from "../../../assets/img/page_404.png";
import seplagmini from "../../../assets/img/seplagmini.png";

function ImgCard({ src, name }: { src: string; name: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 160,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e6e6e6",
          borderRadius: 6,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <img
          src={src}
          alt={name}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: "#333", textAlign: "center" }}>{name}</div>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Galeria de imagens",
    description: "Imagens disponíveis em `src/assets/img` para uso nos componentes e exemplos.",
    example: (
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        <ImgCard src={apoioSti} name="apoio-sti.png" />
        <ImgCard src={defaultAvatar} name="default-avatar.jpg" />
        <ImgCard src={favicon} name="favicon.png" />
        <ImgCard src={fotoDefault} name="fotoDefault.jpg" />
        <ImgCard src={logoSeplagT} name="LOGO SEPLAG - AZUL (T) VAZADO.svg" />
        <ImgCard src={logoSeplagWhite} name="LOGO SEPLAG - BRANCO VAZADO.svg" />
        <ImgCard src={logoSeplagPng} name="logo-seplag.png" />
        <ImgCard src={logoBranco} name="Logo_Branco_Estado_MT.png" />
        <ImgCard src={manopla} name="manopla.jpg" />
        <ImgCard src={mtLogin} name="mt-login.png" />
        <ImgCard src={page404} name="page_404.png" />
        <ImgCard src={seplagmini} name="seplagmini.png" />
      </div>
    ),
    code: "// Importe as imagens de `src/assets/img` e utilize em imagens de componentes e docs.",
  },
];

const props: DocProp[] = [
  {
    name: "Pasta",
    type: "src/assets/img",
    required: true,
    description: "Imagens e logos usados pela aplicação e documentação.",
  },
];

export default function ImagesDoc() {
  return (
    <DocPage
      title="Assets: Imagens"
      description="Galeria de imagens públicas disponíveis na biblioteca para uso em componentes e exemplos."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import logo from "@seplag/ui-lib-react-18/src/assets/img/logo-seplag.png";`}
      sections={sections}
      props={props}
    />
  );
}
