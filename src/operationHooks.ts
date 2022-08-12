import { TypeOperation, SystemOperation, KeyValueMap } from './constants';
import {
    CreateResourceRequest,
    UpdateResourceRequest,
    PatchResourceRequest,
    ReadResourceRequest,
    vReadResourceRequest,
    DeleteResourceRequest,
    ConditionalDeleteResourceRequest,
} from './persistence';
import { GlobalSearchRequest, TypeSearchRequest, SearchResponse } from './search';
import { GenericResponse } from './genericResponse';
import { BatchRequest, TransactionRequest, BundleResponse } from './bundle';

/**
 * The type of hooks subscribers can hook into
 */
export type OperationType =
    | `pre-${TypeOperation}`
    | `post-${TypeOperation}`
    | `pre-${SystemOperation}`
    | `post-${SystemOperation}`;

/**
 * Subscriber's response to an operation event being fired
 */
export interface OperationEventResponse {
    success: boolean;
    errors?: Error[];
}

/**
 * Aggregate type for all subscriber's response to operation events being fired
 */
export interface AggregateOperationEventResponse {
    responses: OperationEventResponse[];
    success: boolean;
    errors: Error[];
}

/**
 * Interface for the payload of an operation hook
 */
export interface OperationEvent {
    userIdentity: KeyValueMap;
    timeStamp: Date;
    request?:
        | CreateResourceRequest
        | UpdateResourceRequest
        | PatchResourceRequest
        | ReadResourceRequest
        | vReadResourceRequest
        | DeleteResourceRequest
        | ConditionalDeleteResourceRequest
        | GlobalSearchRequest
        | TypeSearchRequest
        | BatchRequest
        | TransactionRequest;
    response?: GenericResponse | SearchResponse | BundleResponse;
    operation: OperationType;
}

/**
 * Interface for the implementation of a pub-sub broker to encapsulate the implementation of hooks
 */
export interface OperationBroker {
    /**
     * Publishes a new operation to subscribers of the operation
     * @param event operation context
     */
    publish(event: OperationEvent): Promise<AggregateOperationEventResponse>;

    /**
     * Subscribe to operations
     * @param operations Operations to subscribe to
     * @param subscriber Function to be called when an operation occurs
     */
    subscribe(
        operations: OperationType[],
        subscriber: (event: OperationEvent) => Promise<OperationEventResponse>,
    ): void;

    /**
     * Unsubscribe from operations
     * @param operations Operations to unsubscribe from
     * @param subscriber Function originally used to subscribe to the operations
     */
    unsubscribe(
        operations: OperationType[],
        subscriber: (event: OperationEvent) => Promise<OperationEventResponse>,
    ): void;
}
