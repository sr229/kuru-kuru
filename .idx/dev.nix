# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "unstable";

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.deno
  ];

  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "bradlc.vscode-tailwindcss"
      "denoland.vscode-deno"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["deno" "task" "start"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        deno-install = "deno install";
      };
      # Runs when the workspace is (re)started
      onStart = {
        # Example: start a background task to watch and re-build backend code
        # watch-backend = "npm run watch-backend";
      };
    };
  };
}
