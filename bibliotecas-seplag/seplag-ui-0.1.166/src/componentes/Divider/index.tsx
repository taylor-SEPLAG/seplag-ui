import gridCss from "../../uteis/Grid";
import { Divider } from "primereact/divider";

export interface DividerSeplagProps {
  cols?: string;
  className?: string;
}

export const DividerSeplag = (props: Readonly<DividerSeplagProps>) => {
  const { cols = "12", className = "" } = props;

  const colClass = gridCss(cols);
  const wrapperClass = className ? `${colClass} ${className}` : colClass;

  return <Divider className={wrapperClass} />;
};

export default DividerSeplag;
