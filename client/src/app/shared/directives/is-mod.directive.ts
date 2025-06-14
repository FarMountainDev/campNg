import {Directive, effect, inject, TemplateRef, ViewContainerRef} from '@angular/core';
import {AccountService} from '../../core/services/account.service';

@Directive({
  selector: '[appIsMod]' // *appIsMod
})
export class IsModDirective {
  private accountService = inject(AccountService);
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);

  constructor() {
    effect(() => {
      if (this.accountService.isModerator()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
    });
  }
}
