import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("affiche le texte", () => {
    render(<Button>Cliquer</Button>);
    expect(screen.getByRole("button", { name: /cliquer/i })).toBeInTheDocument();
  });

  it("appelle onClick au clic", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Cliquer</Button>);
    await userEvent.click(screen.getByRole("button", { name: /cliquer/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("est disabled quand loading=true", () => {
    render(<Button loading>Cliquer</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/chargement/i);
  });
});
