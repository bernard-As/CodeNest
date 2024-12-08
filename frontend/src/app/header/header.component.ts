import { Component, ViewChild } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AppStore } from '../app.store';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MenubarModule,ButtonModule,FormsModule,
    CommonModule,AutoCompleteModule,OverlayPanelModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(public appStore: AppStore) {}
  menuItems: MenuItem[] = [];
  searchQuery: string = '';
  filteredSuggestions: any[] = [];
  allSuggestions: any[] = [
    { name: 'Project A',value:1 },
    { name: 'Project B' },
    { name: 'CodeNest Backend' },
    { name: 'CodeNest Frontend' },
    { name: 'Angular Tutorials' },
  ];
  @ViewChild('searchPanel') searchPanel!: OverlayPanel; // Declare the reference

  items = [
    { label: 'Home', icon: 'pi pi-home', routerLink: '/' },
    { label: 'Projects', icon: 'pi pi-folder', routerLink: '/projects' },
    { label: 'Contributors', icon: 'pi pi-users', routerLink: '/contributors' },
    { label: 'About', icon: 'pi pi-info', routerLink: '/about' },
    {
      label: 'Search',
      icon: 'pi pi-search menu-icon',
      command: (event: any) => {
        this.searchPanel.toggle(event); // Toggle the search panel
      },
    },
  ];
  

  search(event: any) {
    const query = event.query.toLowerCase();
    this.filteredSuggestions = this.allSuggestions.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }

  // Handle item selection
  onSelect(event: any) {
    console.log('Selected Item:', event);
    // Add navigation or other logic here
  }

  ngOnInit() {
    // Define menu items
    this.menuItems = [
      { label: 'Home', icon: 'pi pi-home', routerLink: '/' },
      { label: 'Projects', icon: 'pi pi-briefcase', routerLink: '/projects' },
      { label: 'About', icon: 'pi pi-info', routerLink: '/about' },
    ];
  }
}
