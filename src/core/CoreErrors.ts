import { Timeout } from '../utility/Timeout';

export class CoreErrors {
    isGlobal: boolean;

    readonly abort: Timeout;
    readonly http: Timeout;
    readonly generic: Timeout;

    constructor() {
        this.isGlobal = false;

        this.abort = new Timeout({ baseTimeout: 0 });
        this.generic = new Timeout({ baseTimeout: 30_000 });
        this.http = new Timeout({ baseTimeout: 180_000 });

        this.addAbort = this.addAbort.bind(this);
        this.addGeneric = this.addGeneric.bind(this);
        this.addHTTP = this.addHTTP.bind(this);
        this.isTimeout = this.isTimeout.bind(this);
        this.getTimeout = this.getTimeout.bind(this);
    }

    addAbort() {
        this.abort.addError();
    }

    addGeneric() {
        this.generic.addError();
    }

    addHTTP() {
        this.http.addError();
    }

    isTimeout() {
        return (
            this.abort.isTimeout() ||
            this.generic.isTimeout() ||
            this.http.isTimeout()
        );
    }

    getTimeout() {
        return this.isTimeout()
            ? Math.max(
                this.abort.pauseFor,
                this.generic.pauseFor,
                this.http.pauseFor,
            )
            : 0;
    }
}