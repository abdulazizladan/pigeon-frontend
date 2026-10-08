import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';

/**
 * Modal confirmation for destructive actions. Every delete / remove / unassign in the app goes
 * through this so the wording, keyboard handling and focus behaviour are the same everywhere.
 *
 * Usage:
 *   <app-confirm-dialog [open]="!!pumpToRemove()" title="Remove pump" confirmLabel="Remove"
 *     [busy]="isRemoving()" (confirmed)="removePump()" (cancelled)="pumpToRemove.set(null)">
 *     Remove <strong>Pump 3</strong>? …
 *   </app-confirm-dialog>
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly open = input.required<boolean>();
  readonly title = input('Are you sure?');
  /** Label on the destructive button. */
  readonly confirmLabel = input('Delete');
  /** Label shown on the destructive button while the request is in flight. */
  readonly busyLabel = input('Working…');
  /** Disables both buttons and shows a spinner while the caller's request runs. */
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelBtn');

  constructor() {
    // Focus the safe option when the dialog opens so Enter never deletes by accident.
    effect(() => {
      if (this.open()) queueMicrotask(() => this.cancelButton()?.nativeElement.focus());
    });
  }

  protected onBackdropClick(event: MouseEvent) {
    if (this.busy()) return;
    if ((event.target as HTMLElement).classList.contains('um-modal-backdrop')) this.cancelled.emit();
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !this.busy()) {
      event.stopPropagation();
      this.cancelled.emit();
    }
  }

  protected cancel() {
    if (!this.busy()) this.cancelled.emit();
  }

  protected confirm() {
    if (!this.busy()) this.confirmed.emit();
  }
}
