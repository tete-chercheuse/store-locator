/**
 * Désigne le worker embarqué, sauf si l'appelant a déjà pris la main.
 *
 * @param workerUrl URL imposée par l'appelant, qui court-circuite tout.
 */
export declare const configureWorker: (workerUrl?: string | null) => void;
