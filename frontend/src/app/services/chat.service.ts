import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  recipient: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  avatar?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline: boolean;
  typing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: WebSocket | null = null;
  private contacts = new BehaviorSubject<ChatContact[]>([]);
  private currentChat = new BehaviorSubject<ChatMessage[]>([]);
  private messageSubject = new Subject<ChatMessage>();
  private typingSubject = new Subject<{userId: string, isTyping: boolean}>();
  private selectedContactSubject = new BehaviorSubject<ChatContact | null>(null);
  private isBrowser: boolean;

  private mockContacts: ChatContact[] = [
    {
      id: '1',
      name: 'Jan Novák',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      lastMessage: 'Jak se máš?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      name: 'Marie Dvořáková',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      lastMessage: 'Můžeme se sejít zítra?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
      unreadCount: 0,
      isOnline: true
    },
    {
      id: '3',
      name: 'Petr Svoboda',
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
      lastMessage: 'Díky za informace',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '4',
      name: 'Eva Horáková',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      lastMessage: 'Přeji hezký den!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '5',
      name: 'Tomáš Procházka',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      lastMessage: 'Potřebuji pomoc s projektem',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
      unreadCount: 0,
      isOnline: true
    }
  ];

  private mockMessages: {[key: string]: ChatMessage[]} = {};

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      // Initialize mock data
      this.contacts.next(this.mockContacts);

      // Generate some mock messages for each contact
      this.mockContacts.forEach(contact => {
        this.mockMessages[contact.id] = this.generateMockMessages(contact.id, contact.name);
      });
    }
  }

  connect(url: string = 'wss://echo.websocket.org'): void {
    if (!this.isBrowser) return;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle different message types
          if (data.type === 'message') {
            const newMessage: ChatMessage = {
              id: data.id || this.generateId(),
              sender: data.sender,
              senderId: data.senderId,
              recipient: data.recipient,
              recipientId: data.recipientId,
              content: data.content,
              timestamp: new Date(data.timestamp || Date.now()),
              isRead: false,
              avatar: data.avatar
            };

            this.messageSubject.next(newMessage);
            this.updateContactLastMessage(data.senderId, data.content);
          } else if (data.type === 'typing') {
            this.typingSubject.next({
              userId: data.userId,
              isTyping: data.isTyping
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        // Try to reconnect after 5 seconds
        setTimeout(() => this.connect(url), 5000);
      };
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
    }
  }

  selectContact(contact: ChatContact): void {
    // Mark messages as read when selecting a contact
    if (contact) {
      const updatedContacts = this.contacts.value.map(c => {
        if (c.id === contact.id) {
          return {...c, unreadCount: 0};
        }
        return c;
      });
      this.contacts.next(updatedContacts);

      // Load chat history for this contact
      const messages = this.mockMessages[contact.id] || [];
      this.currentChat.next(messages);

      // Set as selected contact
      this.selectedContactSubject.next(contact);
    }
  }

  sendMessage(recipientId: string, content: string): void {
    if (!content.trim()) return;

    const selectedContact = this.selectedContactSubject.value;
    if (!selectedContact) return;

    const message: ChatMessage = {
      id: this.generateId(),
      sender: 'Me',
      senderId: 'current-user',
      recipient: selectedContact.name,
      recipientId: recipientId,
      content: content,
      timestamp: new Date(),
      isRead: true
    };

    // Add to current chat
    const currentMessages = this.currentChat.value;
    this.currentChat.next([...currentMessages, message]);

    // Update last message for the contact
    this.updateContactLastMessage(recipientId, content, true);

    // Send via WebSocket if connected
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'message',
        ...message
      }));
    } else {
      console.warn('WebSocket not connected, message not sent');

      // For demo, simulate receiving a reply after 2-5 seconds
      setTimeout(() => {
        const replies = [
          'Díky za zprávu!',
          'Rozumím, ozvu se později.',
          'To zní skvěle!',
          'Můžeme se o tom pobavit zítra?',
          'Souhlasím s tebou.'
        ];

        const reply: ChatMessage = {
          id: this.generateId(),
          sender: selectedContact.name,
          senderId: selectedContact.id,
          recipient: 'Me',
          recipientId: 'current-user',
          content: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date(),
          isRead: false,
          avatar: selectedContact.avatar
        };

        // Add to current chat
        const messages = this.currentChat.value;
        this.currentChat.next([...messages, reply]);

        // Update contact
        this.updateContactLastMessage(selectedContact.id, reply.content);

        // Emit message
        this.messageSubject.next(reply);
      }, 2000 + Math.random() * 3000);
    }
  }

  sendTypingStatus(recipientId: string, isTyping: boolean): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing',
        userId: 'current-user',
        recipientId: recipientId,
        isTyping: isTyping
      }));
    }

    // For demo: update contact typing status
    const updatedContacts = this.contacts.value.map(c => {
      if (c.id === recipientId) {
        return {...c, typing: isTyping};
      }
      return c;
    });
    this.contacts.next(updatedContacts);
  }

  getContacts(): Observable<ChatContact[]> {
    return this.contacts.asObservable();
  }

  getCurrentChat(): Observable<ChatMessage[]> {
    return this.currentChat.asObservable();
  }

  getMessages(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  getTypingStatus(): Observable<{userId: string, isTyping: boolean}> {
    return this.typingSubject.asObservable();
  }

  getSelectedContact(): Observable<ChatContact | null> {
    return this.selectedContactSubject.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private updateContactLastMessage(contactId: string, message: string, isSent: boolean = false): void {
    const contacts = this.contacts.value.map(contact => {
      if (contact.id === contactId) {
        return {
          ...contact,
          lastMessage: message,
          lastMessageTime: new Date(),
          unreadCount: isSent ? contact.unreadCount : contact.unreadCount + 1
        };
      }
      return contact;
    });

    // Sort contacts by last message time
    contacts.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
    });

    this.contacts.next(contacts);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateMockMessages(contactId: string, contactName: string): ChatMessage[] {
    const messages: ChatMessage[] = [];
    const count = 5 + Math.floor(Math.random() * 10);
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const isFromContact = Math.random() > 0.5;
      messages.push({
        id: this.generateId(),
        sender: isFromContact ? contactName : 'Me',
        senderId: isFromContact ? contactId : 'current-user',
        recipient: isFromContact ? 'Me' : contactName,
        recipientId: isFromContact ? 'current-user' : contactId,
        content: this.getRandomMessage(isFromContact),
        timestamp: new Date(now.getTime() - (count - i) * 1000 * 60 * 10),
        isRead: true
      });
    }

    return messages;
  }

  private getRandomMessage(isFromContact: boolean): string {
    const contactMessages = [
      'Ahoj, jak se máš?',
      'Máš čas se sejít tento týden?',
      'Díky za informace!',
      'Viděl jsi ten nový film?',
      'Co děláš o víkendu?',
      'Můžeš mi poslat ty dokumenty?',
      'Mám pro tebe skvělý nápad.',
      'Potřebuji tvou pomoc s jedním projektem.'
    ];

    const userMessages = [
      'Mám se dobře, díky!',
      'Bohužel tento týden nemám čas.',
      'V pohodě, není zač.',
      'Ještě ne, ale chystám se na to.',
      'Asi pojedu na výlet.',
      'Pošlu ti je večer.',
      'To zní zajímavě, povíš mi víc?',
      'Jasně, rád pomůžu.'
    ];

    const messages = isFromContact ? contactMessages : userMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
