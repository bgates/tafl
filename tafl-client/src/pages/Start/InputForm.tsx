import { Input } from "pages/Start/Input";
import { ChoiceButton } from "pages/Start/ChoiceButton";

type InputFormProps = {
  stepBack: () => void;
  onSubmit: () => void;
  onChangeName: React.ChangeEventHandler;
  onChangeRoom: React.ChangeEventHandler;
  newGame: null | boolean;
  name: string;
  room: string;
};

export const InputForm = ({
  stepBack,
  onSubmit,
  onChangeName,
  onChangeRoom,
  newGame,
  name,
  room,
}: InputFormProps) => (
  <div className="input-container">
    <Input
      name="name"
      placeholder="Your Name..."
      onChange={onChangeName}
      value={name}
    />
    {newGame ? null : (
      <Input
        name="room"
        placeholder="Room ID..."
        onChange={onChangeRoom}
        value={room}
      />
    )}
    <div className="nav-container">
      <ChoiceButton
        type="nav-back"
        choice="back"
        onChoice={stepBack}
        label="Back"
      />
      <ChoiceButton
        type="nav-forward"
        choice="submit"
        onChoice={onSubmit}
        label="Let's Go"
      />
    </div>
  </div>
);
