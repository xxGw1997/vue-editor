export function useCommand() {
  const state = {
    current: -1,
    queue: [],
    commands: {},
    commandArray: [],
  };

  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = () => {
      const { cb } = command.execute();
      cb();
    };
  };

  const commandList = [
    {
      name: "redo",
      keyboard: "ctrl+y",
      execute() {
        return {
          cb() {
            console.log("重做");
          },
        };
      },
    },
    {
      name: "undo",
      keyboard: "ctrl+z",
      execute() {
        return {
          cb() {
            console.log("撤销");
          },
        };
      },
    },
  ];

  commandList.forEach((i) => {
    registry(i);
  });

  return state;
}
