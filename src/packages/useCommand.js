import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { events } from "./events";

export function useCommand(data) {
  const state = {
    current: -1,
    queue: [],
    commands: {},
    commandArray: [],
    destroyArray: [],
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
      name: "forward",
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
      name: "back",
      keyboard: "ctrl+z",
      execute() {
        return {
          cb() {
            console.log("撤销");
          },
        };
      },
    },
    {
      name: "drag",
      pushQueue: true,
      init() {
        this.before = null;
        const start = () => {
          this.before = deepcopy(data.value.blocks)
        };
        const end = () => {
          state.commands.drag();
        }
        events.on("start", start);
        events.on("end", end);

        return () => {
          events.off("start", start);
          events.off("end", end);
        };
      },
      execute() {
        let before = this.before;
        let after = data.value.blocks;
        return {
          back() {
            data.value = { ...data.value, blocks: before };
          },
          forward() {
            data.value = { ...data.value, blocks: after };
          },
          cb(){
            console.log('cb');
          }
        };
      },
    },
  ];

  commandList.forEach((i) => {
    registry(i);
  });

  (() => {
    state.commandArray.forEach(
      (command) => command.init && state.destroyArray.push(command.init())
    );
  })();

  onUnmounted(() => {
    state.destroyArray.forEach((fn) => fn && fn());
  });


  return state;
}
