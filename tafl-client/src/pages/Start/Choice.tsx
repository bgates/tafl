import { ChoiceButton } from "pages/Start/ChoiceButton";

type ChoiceProps = {
  banner: string;
  onChoice: (choice: string) => void;
};
export const Choice = ({ banner, onChoice }: ChoiceProps) => (
  <div className="choice-container">
    <a href="/">
      <img src={banner} alt="Viking Chess!" height={200} />
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
