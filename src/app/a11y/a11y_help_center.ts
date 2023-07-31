/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';

import {ShortcutConfig, ShortcutService} from './shortcut.service';


const MSG_TURN_ON_ALL_SHORTCUTS_TOOLTIP = 'Check to turn on all shortcuts';
const MSG_TURN_OFF_ALL_SHORTCUTS_TOOLTIP = 'Uncheck to turn off all shortcuts';
const MSG_TURN_OFF_SHORTCUT_TOOLTIP = 'Uncheck to turn off this shortcut';
const MSG_TURN_ON_SHORTCUT_TOOLTIP = 'Check to turn on this shortcut';

/**
 * A11y Help Center Dialog
 */
@Component({
  selector: 'a11y-help-center',
  styleUrls: ['a11y_help_center.scss'],
  templateUrl: 'a11y_help_center.ng.html',
  standalone: true,
  imports: [
    MatButtonModule, MatDialogModule, MatTableModule, MatCheckboxModule,
    ReactiveFormsModule, MatTooltipModule
  ],
})
export class AccessibilityHelpCenter {
  displayedColumns: string[] = ['enabled', 'desc', 'shortcut'];
  dataSource: ShortcutConfig[] = [];
  form!: FormGroup<{
    shortcuts: FormGroup<{
      [key: string]: FormGroup<
          {enabled: FormControl<boolean>, shortcut: FormControl<string>}>
    }>,
    settings: FormGroup<{}>,
  }>;

  constructor(
      private readonly shortcutService: ShortcutService,
      private readonly fb: FormBuilder) {
    this.dataSource = Object.values(this.shortcutService.shortcuts);
    this.form = this.fb.group({
      shortcuts: this.fb.group(this.dataSource.reduce(
          (a, {name, enabled, shortcut}) =>
              ({...a, [name]: this.fb.group({enabled, shortcut})}),
          {})),
      settings: this.fb.group({}),
    });
  }

  save() {
    // this.shortcutService.reloadShortcuts();
  }

  toggleAll(enabled: boolean) {
    Object.keys(this.form.get('shortcuts')!.value).forEach((key) => {
      this.form.patchValue({shortcuts: {[key]: {enabled}}});
    });
  }

  enableAllTooltip() {
    return this.allEnabled() ? MSG_TURN_OFF_ALL_SHORTCUTS_TOOLTIP :
                               MSG_TURN_ON_ALL_SHORTCUTS_TOOLTIP;
  }

  enableTooltip(name: ShortcutConfig['name']) {
    return this.form.get(['shortcuts', name, 'enabled'])!.value ?
        MSG_TURN_OFF_SHORTCUT_TOOLTIP :
        MSG_TURN_ON_SHORTCUT_TOOLTIP;
  }

  allEnabled() {
    return Object.values(this.form.get('shortcuts')!.value)
        .every(value => value?.enabled);
  }

  someEnabled() {
    return !this.allEnabled() &&
        Object.values(this.form.get('shortcuts')!.value)
            .some(value => value?.enabled);
  }

  restoreDefault() {
    // TODO b/293855097
  }
}
