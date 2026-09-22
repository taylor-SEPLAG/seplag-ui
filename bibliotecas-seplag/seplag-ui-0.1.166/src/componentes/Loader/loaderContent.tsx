import logo from "../../assets/img/Logo_Branco_Estado_MT.png";
import "./loader.css";

export function loaderSeplag(message = "Carregando") {
  const dots = ["first", "second", "third", "fourth"];
  const displayMessage = message.trim() || "Carregando";

  return (
    <div className="loader-overlay" id="loader-seplag" data-testid="loader-seplag">
      <img className="text" src={logo} alt="loader" />
      <div className="lds-ellipsis">
        {dots.map((dot) => (
          <div key={`loader-dot-${dot}`}></div>
        ))}
      </div>
      <span className="msg">{displayMessage}</span>
    </div>
  );
}
