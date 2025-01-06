import { Component, ViewChild } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AppStore } from '../app.store';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MenubarModule,ButtonModule,FormsModule,
    CommonModule,AutoCompleteModule,OverlayPanelModule,
    ToastModule,AvatarModule,TooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [MessageService]
})
export class HeaderComponent {
  constructor(public appStore: AppStore,
    private messageService: MessageService
  ) {}
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
    // {
    //   label: 'Search',
    //   icon: 'pi pi-search menu-icon',
    //   command: (event: any) => {
    //     this.searchPanel.toggle(event); // Toggle the search panel
    //   },
    // },
  ];
  

  search(event: any) {
    const query = event.query?.toLowerCase().trim();
    this.filteredSuggestions = query
      ? this.allSuggestions.filter((item) => item.name.toLowerCase().includes(query))
      : [];
  }

  // Handle item selection
  onSelect(event: any) {
    console.log('Selected Item:', event);
    // Add navigation or other logic here
  }

  showToast(mess:any) {
    this.messageService.add({

      severity: mess.severity,

      summary: mess.summary,

      detail: mess.detail,

      life: 3000 // Duration in milliseconds

    });

  }

  ngOnInit() {
    
    // Define menu items
    this.menuItems = [
      { label: 'Home', icon: 'pi pi-home', routerLink: '/' },
      { label: 'Projects', icon: 'pi pi-briefcase', routerLink: '/projects' },
      { label: 'About', icon: 'pi pi-info', routerLink: '/about' },
    ];
    this.appStore.toastMessage.map((mess:any)=>{
      this.showToast(mess)
    });
    this.appStore.verifyToken();
  }
  //Toast Message displayer
  
  

}
