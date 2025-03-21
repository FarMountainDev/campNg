import { Component } from '@angular/core';
import {MatBadge} from "@angular/material/badge";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-footer',
    imports: [
        MatBadge,
        MatButton,
        MatIcon
    ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
