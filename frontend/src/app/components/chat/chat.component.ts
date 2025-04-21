import { Component, OnInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID, Inject, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatContact, ChatMessage } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex h-full rounded-xl overflow-hidden border dark:border-gray-700 shadow-lg">
      <!-- Contacts Sidebar -->
      <div class="w-1/3 md:w-1/4 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div class="p-4 border-b dark:border-gray-700">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white flex items-center justify-between">
            Messages
            <button class="text-blue-500 hover:text-blue-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </h2>
        </div>
        <div class="overflow-y-auto flex-grow">
          <div *ngFor="let contact of contacts"
               (click)="selectContact(contact)"
               class="flex items-center p-3 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
               [class.bg-blue-50]="selectedContact?.id === contact.id"
               [class.dark:bg-gray-700]="selectedContact?.id === contact.id">
            <div class="relative">
              <img [src]="contact.avatar" [alt]="contact.name" class="w-12 h-12 rounded-full object-cover">
              <span *ngIf="contact.isOnline" class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </div>
            <div class="ml-3 flex-grow overflow-hidden">
              <div class="flex justify-between items-center">
                <h3 class="font-medium text-gray-900 dark:text-white truncate">{{ contact.name }}</h3>
                <span *ngIf="contact.lastMessageTime" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatTime(contact.lastMessageTime) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <p *ngIf="!contact.typing" class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ contact.lastMessage }}
                </p>
                <p *ngIf="contact.typing" class="text-sm text-blue-500 dark:text-blue-400 italic truncate">
                  typing...
                </p>
                <span *ngIf="contact.unreadCount > 0" class="ml-2 flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                  {{ contact.unreadCount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="w-2/3 md:w-3/4 flex flex-col bg-white dark:bg-gray-900">
        <div *ngIf="!selectedContact" class="flex-grow flex items-center justify-center p-8">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Your Messages</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">Send private messages to a friend</p>
          </div>
        </div>

        <div *ngIf="selectedContact" class="flex flex-col h-full">
          <!-- Chat Header -->
          <div class="p-3 border-b dark:border-gray-700 flex items-center">
            <img [src]="selectedContact.avatar" [alt]="selectedContact.name" class="w-10 h-10 rounded-full object-cover">
            <div class="ml-3">
              <h3 class="font-medium text-gray-900 dark:text-white">{{ selectedContact.name }}</h3>
              <p *ngIf="selectedContact.isOnline" class="text-xs text-green-500">Active now</p>
              <p *ngIf="!selectedContact.isOnline" class="text-xs text-gray-500 dark:text-gray-400">Offline</p>
            </div>
            <div class="ml-auto flex space-x-2">
              <button class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div #messageContainer class="flex-grow p-4 overflow-y-auto" [scrollTop]="scrollTop">
            <div *ngFor="let message of currentChat"
                 class="mb-4"
                 [ngClass]="{'flex justify-end': message.senderId === 'current-user', 'flex': message.senderId !== 'current-user'}">
              <div *ngIf="message.senderId !== 'current-user'" class="flex-shrink-0 mr-3">
                <img [src]="selectedContact.avatar" [alt]="selectedContact.name" class="w-8 h-8 rounded-full">
              </div>
              <div [ngClass]="{
                'bg-blue-500 text-white rounded-3xl rounded-tr-md py-2 px-4 max-w-xs': message.senderId === 'current-user',
                'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-3xl rounded-tl-md py-2 px-4 max-w-xs': message.senderId !== 'current-user'
              }">
                <p>{{ message.content }}</p>
                <p class="text-xs mt-1 opacity-70">{{ formatMessageTime(message.timestamp) }}</p>
              </div>
            </div>
            <div *ngIf="isTyping" class="flex mb-4">
              <div class="flex-shrink-0 mr-3">
                <img [src]="selectedContact?.avatar" [alt]="selectedContact?.name" class="w-8 h-8 rounded-full">
              </div>
              <div class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-3xl rounded-tl-md py-2 px-4">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce"></div>
                  <div class="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="border-t dark:border-gray-700 p-3">
            <form (submit)="sendMessage()" class="flex items-center">
              <button type="button" class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <input
                type="text"
                [(ngModel)]="messageText"
                name="messageText"
                (input)="onTyping()"
                placeholder="Message..."
                class="flex-grow mx-3 py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
              <button type="submit" [disabled]="!messageText.trim()" class="p-2 rounded-full text-blue-500  hover:text-blue-600 disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  contacts: ChatContact[] = [];
  currentChat: ChatMessage[] = [];
  selectedContact: ChatContact | null = null;
  messageText: string = '';
  isTyping: boolean = false;
  scrollTop: number = 0;

  private contactsSubscription: Subscription | null = null;
  private currentChatSubscription: Subscription | null = null;
  private selectedContactSubscription: Subscription | null = null;
  private messageSubscription: Subscription | null = null;
  private typingSubscription: Subscription | null = null;
  private typingTimer: any = null;
  private isBrowser: boolean;

  constructor(
    private chatService: ChatService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // Connect to WebSocket server
      this.chatService.connect();

      // Subscribe to contacts
      this.contactsSubscription = this.chatService.getContacts().subscribe(
        contacts => this.contacts = contacts
      );

      // Subscribe to current chat
      this.currentChatSubscription = this.chatService.getCurrentChat().subscribe(
        messages => {
          this.currentChat = messages;
          this.scrollToBottom();
        }
      );

      // Subscribe to selected contact
      this.selectedContactSubscription = this.chatService.getSelectedContact().subscribe(
        contact => this.selectedContact = contact
      );

      // Subscribe to new messages
      this.messageSubscription = this.chatService.getMessages().subscribe(
        message => {
          // If message is from current chat, add it
          if (this.selectedContact && (
              message.senderId === this.selectedContact.id ||
              message.recipientId === this.selectedContact.id
          )) {
            this.currentChat = [...this.currentChat, message];
            this.scrollToBottom();
          }
        }
      );

      // Subscribe to typing status
      this.typingSubscription = this.chatService.getTypingStatus().subscribe(
        status => {
          if (this.selectedContact && status.userId === this.selectedContact.id) {
            this.isTyping = status.isTyping;
            if (this.isTyping) {
              this.scrollToBottom();
            }
          }
        }
      );
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  selectContact(contact: ChatContact): void {
    this.chatService.selectContact(contact);
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.selectedContact) return;

    this.chatService.sendMessage(this.selectedContact.id, this.messageText);
    this.messageText = '';

    // Clear typing indicator
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
      this.chatService.sendTypingStatus(this.selectedContact.id, false);
    }
  }

  onTyping(): void {
    if (!this.selectedContact) return;

    // If timer doesn't exist, send typing status
    if (!this.typingTimer) {
      this.chatService.sendTypingStatus(this.selectedContact.id, true);
    }

    // Clear existing timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    // Set new timer to clear typing status after 2 seconds of inactivity
    this.typingTimer = setTimeout(() => {
      if (this.selectedContact) {
        this.chatService.sendTypingStatus(this.selectedContact.id, false);
      }
      this.typingTimer = null;
    }, 2000);
  }

  scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        const element = this.messageContainer.nativeElement;
        this.scrollTop = element.scrollHeight;
      }
    } catch(err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  formatTime(date: Date | undefined): string {
    if (!date) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date > today) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date > yesterday) {
      // Yesterday
      return 'Yesterday';
    } else {
      // Before yesterday, show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.contactsSubscription) this.contactsSubscription.unsubscribe();
    if (this.currentChatSubscription) this.currentChatSubscription.unsubscribe();
    if (this.selectedContactSubscription) this.selectedContactSubscription.unsubscribe();
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
    if (this.typingSubscription) this.typingSubscription.unsubscribe();

    // Clear any timers
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    // Disconnect WebSocket
    this.chatService.disconnect();
  }
}
