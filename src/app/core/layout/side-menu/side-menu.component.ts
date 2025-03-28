import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css'
})
export class SideMenuComponent {
  menuItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Cuentas', route: '/dashboard/accounts', icon: 'credit-card' },
    // Agrega otros elementos de menú según necesites
  ];
} 