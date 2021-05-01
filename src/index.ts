import { NextFunction, Request, Response, RequestHandler } from 'express';

export class ExpressMaintenance<
  MaintenanceResponseBody extends Record<string, any>
> {
  private readonly url: string = '/maintenance';
  private readonly apiBasePath: string = '/api';
  private readonly accessKey?: string;
  private readonly localMaintenanceStateTTL: number = 60000;

  private readonly getExternalMaintenanceState: GetExternalMaintenanceStateFunction<MaintenanceResponseBody>;
  private readonly setExternalMaintenanceState: SetExternalMaintenanceStateFunction<MaintenanceResponseBody>;

  private lastStateUpdateTimestamp: Date;
  private currentServerMode: ServerMode = ServerMode.default;
  private maintenanceResponseOptions: MaintenanceResponseOptions<MaintenanceResponseBody> = {
    statusCode: 503
  };

  constructor(options?: ExpressMaintenanceOptions<MaintenanceResponseBody>) {
    if (options) {
      this.url = options.url ?? this.url;
      this.apiBasePath = options.apiBasePath ?? this.apiBasePath;
      this.accessKey = options.accessKey ?? this.accessKey;
      this.localMaintenanceStateTTL =
        options.localMaintenanceStateTTL ?? this.localMaintenanceStateTTL;
      this.getExternalMaintenanceState =
        options.getExternalMaintenanceState ?? this.getExternalMaintenanceState;
      this.setExternalMaintenanceState =
        options.setExternalMaintenanceState ?? this.setExternalMaintenanceState;
    }

    this.lastStateUpdateTimestamp = new Date();
  }

  public get middleware(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      await this.updateLocalMaintenanceState();

      if (this.isServerInMaintenanceMode() && this.isApiRequest(request)) {
        response.status(this.maintenanceResponseOptions.statusCode);
        return response.json(this.maintenanceResponseOptions.body);
      }

      if (this.isMaintenanceRequest(request)) {
        const { accessKey } = request.query;
        if (this.accessKey && accessKey !== this.accessKey) {
          response.status(401);
          return response.json({
            message: 'You not authorized to perform this action'
          });
        }

        switch (request.method) {
          case 'GET':
            response.status(200);
            return response.json({
              message: `Server in ${this.currentServerMode} mode now`
            });
          case 'POST':
            this.currentServerMode = ServerMode.maintenance;
            this.maintenanceResponseOptions.statusCode =
              request.body?.statusCode ??
              this.maintenanceResponseOptions?.statusCode;
            this.maintenanceResponseOptions.body =
              request.body?.body ?? this.maintenanceResponseOptions?.body;
            if (this.setExternalMaintenanceState) {
              await this.setExternalMaintenanceState(
                this.getLocalMaintenanceState()
              );
            }

            break;
          case 'DELETE':
            this.currentServerMode = ServerMode.default;
            if (this.setExternalMaintenanceState) {
              await this.setExternalMaintenanceState(
                this.getLocalMaintenanceState()
              );
            }

            break;
          default:
            response.status(405);
            return response.json({
              message: `${request.method} is not allowed for this endpoint`
            });
        }

        response.status(200);
        return response.json({
          message: `Server in ${this.currentServerMode} mode now`,
          maintenanceResponseOptions: this.maintenanceResponseOptions
        });
      }

      next();
    };
  }

  private async updateLocalMaintenanceState(): Promise<void> {
    if (
      this.getExternalMaintenanceState &&
      this.isItTimeToUpdateLocalMaintenanceState()
    ) {
      const mayBePromise = this.getExternalMaintenanceState();
      const externalMaintenanceState: MaintenanceState<MaintenanceResponseBody> =
        mayBePromise[Symbol.toStringTag] === 'Promise'
          ? await mayBePromise
          : (mayBePromise as MaintenanceState<MaintenanceResponseBody>);
      if (!externalMaintenanceState) {
        return;
      }

      const {
        currentServerMode,
        maintenanceResponseOptions
      }: MaintenanceState<MaintenanceResponseBody> = externalMaintenanceState;
      this.currentServerMode = currentServerMode;
      this.maintenanceResponseOptions = maintenanceResponseOptions;
      this.lastStateUpdateTimestamp = new Date();
    }
  }

  private isItTimeToUpdateLocalMaintenanceState(): boolean {
    if (process.env.NODE_ENV === 'test') {
      return true;
    }

    return (
      this.lastStateUpdateTimestamp.getTime() + this.localMaintenanceStateTTL <
      Date.now()
    );
  }

  private isServerInMaintenanceMode(): boolean {
    return this.currentServerMode === ServerMode.maintenance;
  }

  private isApiRequest(request: Request): boolean {
    return request.path.includes(this.apiBasePath);
  }

  private isMaintenanceRequest(request: Request): boolean {
    const urlRegExp = new RegExp(`${this.url}$`);
    return Boolean(urlRegExp.test(request.path));
  }

  private getLocalMaintenanceState(): MaintenanceState<MaintenanceResponseBody> {
    return {
      currentServerMode: this.currentServerMode,
      maintenanceResponseOptions: this.maintenanceResponseOptions
    };
  }

  public getContext(): ExpressMaintenanceOptions<MaintenanceResponseBody> &
    MaintenanceResponseOptions<MaintenanceResponseBody> {
    return {
      url: this.url,
      apiBasePath: this.apiBasePath,
      accessKey: this.accessKey,
      localMaintenanceStateTTL: this.localMaintenanceStateTTL,
      getExternalMaintenanceState: this.getExternalMaintenanceState,
      setExternalMaintenanceState: this.setExternalMaintenanceState,
      ...this.maintenanceResponseOptions
    };
  }
}

export type GetExternalMaintenanceStateFunction<
  MaintenanceResponseBody extends Record<string, any>
> = () =>
  | MaintenanceState<MaintenanceResponseBody>
  | Promise<MaintenanceState<MaintenanceResponseBody>>;

export type SetExternalMaintenanceStateFunction<
  MaintenanceResponseBody extends Record<string, any>
> = (
  maintenanceState: MaintenanceState<MaintenanceResponseBody>
) => void | Promise<void>;

export interface MaintenanceState<
  MaintenanceResponseBody extends Record<string, any>
> {
  currentServerMode?: ServerMode;
  maintenanceResponseOptions?: MaintenanceResponseOptions<MaintenanceResponseBody>;
}

export enum ServerMode {
  default = 'default',
  maintenance = 'maintenance'
}

export interface MaintenanceResponseOptions<
  MaintenanceResponseBody extends Record<string, any>
> {
  statusCode?: number;
  body?: MaintenanceResponseBody;
}

export interface ExpressMaintenanceOptions<
  MaintenanceResponseBody extends Record<string, any>
> {
  url?: string;
  apiBasePath?: string;
  accessKey?: string;
  localMaintenanceStateTTL?: number;
  getExternalMaintenanceState?: GetExternalMaintenanceStateFunction<MaintenanceResponseBody>;
  setExternalMaintenanceState?: SetExternalMaintenanceStateFunction<MaintenanceResponseBody>;
}
