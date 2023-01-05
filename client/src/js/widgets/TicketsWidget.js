import Tickets from '../Tickets';
import Request from '../request';
import Modal from '../modals/Modal';
import DeleteModal from '../modals/DeleteModal';

export default class TicketsWidget {
  constructor() {
    this.container = null;
    this.ticketsWrapper = document.querySelector('.tickets');
    this.modal = new Modal(document.body);
    this.deleteModal = new DeleteModal(document.body, this.modal);
    this.id = null;
    this.addBtn = document.querySelector('.add-btn');
    this.request = new Request();
    this.addTicket = this.addTicket.bind(this);
    this.editTicket = this.editTicket.bind(this);
    this.checkTicket = this.checkTicket.bind(this);
    this.ticketActions = this.ticketActions.bind(this);
    this.tickets = [];
  }

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('Контейнер не "HTMLElement"');
    }
    this.container = container;
  }

  init() {
    this.deleteModal.init();
    this.delOkBtn = document.querySelector('.del-ok-btn');
    this.renderAllTickets();

    this.addBtn.addEventListener('click', (event) => {
      event.preventDefault();

      this.modal.drawModal('addTicket');
      this.modal.modalHandler(this.addTicket);
    });

    this.delOkBtn.addEventListener('click', (event) => {
      event.preventDefault();
      this.deleteTicket(this.id);
    });
  }

  renderAllTickets() {
    const request = this.request.allTickets();
    request.then((resolve) => {
      this.tickets = [];
      this.ticketsWrapper.innerHTML = '';
      resolve.forEach((item) => {
        const ticket = new Tickets(
          item.id,
          item.name,
          item.status,
          item.created,
        );
        this.tickets.push(ticket);
      });
      for (const elem of this.tickets) {
        this.ticketsWrapper.append(elem);
      }
    });
    this.ticketsWrapper.addEventListener('click', this.ticketActions);
  }

  ticketActions(event) {
    event.preventDefault();

    const curTicket = event.target.closest('.ticket');
    this.id = curTicket.dataset.id;

    if (event.target.classList.contains('delete-btn')) {
      this.deleteModal.openDeleteModal();
    }

    if (event.target.classList.contains('edit-btn')) {
      const request = this.request.ticketById(this.id);
      request.then((resolve) => {
        this.modal.modal.querySelector('.input-name').value = resolve.name;
        this.modal.modal.querySelector('.input-description').value = resolve.description;
      });

      this.modal.drawModal('editTicket');
      this.modal.modalHandler(this.editTicket);
    }

    if (
      event.target.classList.contains('ticket-name')
      || event.target.classList.contains('ticket-description')
    ) {
      const ticketDes = curTicket.querySelector('.ticket-description');

      if (ticketDes) {
        ticketDes.remove();
      } else {
        const request = this.request.ticketById(this.id);
        request.then((resolve) => {
          const description = document.createElement('div');
          description.classList.add('ticket-description');
          description.innerText = resolve.description;
          curTicket.querySelector('.ticket-content').append(description);
        });
      }
    }

    if (
      event.target.classList.contains('ticket-span')
      || event.target.classList.contains('ticket-checkbox')
    ) {
      if (curTicket.querySelector('.ticket-checkbox').checked) {
        this.status = false;
      } else {
        this.status = true;
      }
      this.checkTicket(this.id, this.status);
    }
  }

  addTicket(event) {
    event.preventDefault();
    const request = this.request.createTicket(
      this.modal.name.value,
      this.modal.description.value,
    );
    request.then(() => {
      this.renderAllTickets();
    });
    this.modal.closeModal(event);
  }

  deleteTicket(id) {
    this.deleteModal.closeDeleteModal();
    const request = this.request.removeById(id);
    request.then(() => {
      this.renderAllTickets();
    });
  }

  editTicket(event) {
    event.preventDefault();
    const request = this.request.editTicket(
      this.id,
      this.modal.name.value,
      this.modal.description.value,
    );
    request.then(() => {
      this.renderAllTickets();
    });

    this.modal.closeModal(event);
  }

  checkTicket(id) {
    const request = this.request.checkTicket(id, this.status);
    request.then(() => {
      this.renderAllTickets();
    });
  }
}
