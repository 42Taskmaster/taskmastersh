interface SendArgs<Event extends string> extends Record<string, unknown> {
    type: Event
}

interface Action<Context, Event extends string> {
    (context: Context, event: SendArgs<Event>): void
}

interface StateNode<Context, State extends string, Event extends string> {
    actions?: Action<Context, Event>[]

    on?: Partial<Record<Event, State>>
}

interface MachineConfig<
    Context extends Record<string, unknown>, State extends string, Event extends string
> {
    context: Context

    initial: State,

    states: Record<State, StateNode<Context, State, Event>>
}

interface Machine<Context, State extends string, Event extends string> {
    readonly currentState: State
    readonly context: Context

    assign(context: Partial<Context>): void
    send(args: SendArgs<Event>): State
}

export function createMachine<
    Context extends Record<string, unknown>, State extends string, Event extends string
>(config: MachineConfig<Context, State, Event>): Machine<Context, State, Event> {
    let currentState = config.initial;
    let context = { ...config.context };

    function assign(newContext: Context) {
        context = {
            ...context,
            ...newContext,
        };
    }

    function send(args: SendArgs<Event>): State {
        function getNextState(): State {
            const currentStateNode = config.states[currentState];
            if (currentStateNode === undefined || currentStateNode.on === undefined) {
                return currentState;
            }

            const nextState: State | undefined = currentStateNode.on[args.type];
            if (nextState === undefined) {
                return currentState;
            }

            return nextState;
        }

        const nextState = getNextState();
        const nextStateNode = config.states[nextState];
        const { actions } = nextStateNode;

        if (actions !== undefined) {
            for (const action of actions) {
                action(context, args);
            }
        }

        currentState = nextState;

        return currentState;
    }

    return {
        get currentState() {
            return currentState;
        },
        get context() {
            return context;
        },
        assign,
        send,
    };
}
