import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@j97tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
