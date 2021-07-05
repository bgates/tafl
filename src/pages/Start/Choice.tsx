import { ChoiceButton } from "pages/Start/ChoiceButton";

type ChoiceProps = {
  logo: string;
  onChoice: (choice: string) => void;
};
export const Choice = ({ logo, onChoice }: ChoiceProps) => (
  <div className="choice-container">
    <a href="/">
      <img src={logo} alt="Viking Chess!" />
    </a>
    <ChoiceButton
      onChoice={onChoice}
      type="primary"
      choice="new"
      label="Start New"
    />
    <ChoiceButton
      onChoice={onChoice}
      type="secondary"
      choice="join"
      label="Join Game"
    />
  </div>
);
