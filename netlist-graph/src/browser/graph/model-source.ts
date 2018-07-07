import { injectable, inject, optional } from 'inversify'
import { TYPES, LocalModelSource, ILogger, IActionDispatcher,
         ActionHandlerRegistry, ViewerOptions, IModelLayoutEngine,
         IStateAwareModelProvider, IPopupModelProvider,
         Action, OpenAction } from 'sprotty/lib'
import { IGraphGenerator } from './graph-generator'

@injectable()
export class NetlistGraphModelSource extends LocalModelSource {

    loadIndicator: (loadStatus: boolean) => void = () => {}

    constructor(@inject(TYPES.IActionDispatcher)
                actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry)
                actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) viewerOptions: ViewerOptions,
                @inject(TYPES.ILogger) logger: ILogger,
                @inject(IGraphGenerator)
                public readonly graphGenerator: IGraphGenerator,
                @inject(TYPES.StateAwareModelProvider) @optional()
                modelProvider?: IStateAwareModelProvider,
                @inject(TYPES.IPopupModelProvider) @optional()
                popupModelProvider?: IPopupModelProvider,
                @inject(TYPES.IModelLayoutEngine) @optional()
                layoutEngine?: IModelLayoutEngine) {
        super(actionDispatcher, actionHandlerRegistry, viewerOptions, logger,
              modelProvider, popupModelProvider, layoutEngine)

        this.currentRoot = {
            type: 'graph',
            id: 'netlist-graph',
            children: []
        }
    }

    protected initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);

        registry.register(OpenAction.KIND, this);
    }

    updateModel(): Promise<void> {
        this.currentRoot.children = this.graphGenerator.elements;
        return super.updateModel();
    }

    handle(action: Action): void {
        switch (action.kind) {
            case OpenAction.KIND:
                this.graphGenerator
                    .openSchematic((action as OpenAction).elementId);
                this.updateModel()
                break;
            default:
                super.handle(action);
        }
    }

}