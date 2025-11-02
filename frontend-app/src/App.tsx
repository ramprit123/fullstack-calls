import { SignInButton, UserButton } from "@clerk/clerk-react";

const App = () => {
  return (
    <div className="flex gap-3">
      App
      <SignInButton />
      <UserButton />
    </div>
  );
};

export default App;
