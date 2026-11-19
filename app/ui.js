(function (global) {
  'use strict';

  const instances = new WeakMap();
  const tableStates = new WeakMap();
  const language = {
    emptyTable: 'Belum ada data.',
    zeroRecords: 'Tidak ada data yang cocok.',
    search: 'Cari:',
    lengthMenu: '_MENU_ baris',
    info: '_START_?_END_ dari _TOTAL_ baris',
    infoEmpty: '0 baris',
    infoFiltered: '(dari _MAX_ baris)',
    paginate: { next: '&gt;', previous: '&lt;' },
    aria: { paginate: { next: 'Halaman berikutnya', previous: 'Halaman sebelumnya' } },
  };

  function mountTable(host, binding) {
    const source = host.querySelector(':scope > table');
    const table = source.cloneNode(true);
    const bindings = new WeakMap();
    const originalElements = source.querySelectorAll('*');
    table.querySelectorAll('*').forEach((element, index) => {
      const original = originalElements[index];
      bindings.set(element, original);
      if (element.matches('input, textarea, select')) {
        element.value = original.value;
        if (element instanceof HTMLInputElement) element.checked = original.checked;
      }
    });

    host.append(table);
    if (!table.tHead) {
      const header = table.createTHead();
      header.hidden = true;
      const row = header.insertRow();
      for (const cell of table.tBodies[0].rows[0].cells) {
        const column = document.createElement('th');
        column.textContent = 'Kolom ' + (cell.cellIndex + 1);
        row.append(column);
      }
    }
    table.addEventListener('click', event => {
      const control = event.target.closest('button, a');
      const original = bindings.get(control);
      if (!original) return;
      event.preventDefault();
      original.click();
    });
    for (const type of ['input', 'change']) {
      table.addEventListener(type, event => {
        const control = event.target;
        const original = bindings.get(control);
        if (!original || !control.matches('input, textarea, select')) return;
        if (control.type !== 'file') original.value = control.value;
        if (control instanceof HTMLInputElement) original.checked = control.checked;
        if (control.type === 'file') original.files = control.files;
        original.dispatchEvent(new Event(type, { bubbles: true }));
      });
    }

    const documentLayout = binding.value === 'document';
    const dashboard = binding.value === 'dashboard';
    const state = tableStates.get(host);
    const nonSortable = [...table.tHead.rows[0].cells]
      .filter(cell => cell.textContent.trim() === 'Aksi').map(cell => cell.cellIndex);
    const instance = new DataTable(table, {
      autoWidth: false,
      order: documentLayout ? [] : state?.order || [],
      search: { search: state?.search || '' },
      pageLength: state?.length || 10,
      language,
      layout: {
        topStart: null, topEnd: dashboard ? null : 'search',
        bottomStart: 'info',
        bottomEnd: { paging: { firstLast: false, numbers: false } },
      },
      ...(nonSortable.length ? { columnDefs: [{ targets: nonSortable, orderable: false }] } : {}),
      ...(documentLayout ? {
        ordering: false, searching: false, paging: false, info: false,
        layout: { topStart: null, topEnd: null, bottomStart: null, bottomEnd: null },
      } : {}),
    });
    const info = instance.page.info();
    if (state?.page && info.pages > 1) instance.page(Math.min(state.page, info.pages - 1)).draw('page');
    instances.set(host, instance);
    host.classList.add('iwoms-table-ready');
    const paginator = host.querySelector('.dt-paging');
    if (paginator) {
      const updatePagination = () => { paginator.hidden = instance.page.info().pages <= 1; };
      updatePagination();
      instance.on('draw', updatePagination);
    }
  }

  function releaseTable(host) {
    const instance = instances.get(host);
    if (!instance) return;
    tableStates.set(host, {
      order: instance.order(), search: instance.search(),
      page: instance.page(), length: instance.page.len(),
    });
    instance.destroy(true);
    instances.delete(host);
    host.classList.remove('iwoms-table-ready');
  }

  function notify(title, text, icon = 'info', timer = 4500) {
    return Swal.fire({
      toast: true, position: 'bottom-end', titleText: title, text,
      icon: ['error', 'warning', 'success', 'info', 'question'].includes(icon) ? icon : 'info',
      showConfirmButton: false, showCloseButton: true, closeButtonAriaLabel: 'Tutup notifikasi',
      timer: timer > 0 ? timer : undefined, timerProgressBar: timer > 0,
      didOpen(popup) {
        popup.addEventListener('mouseenter', Swal.stopTimer);
        popup.addEventListener('mouseleave', Swal.resumeTimer);
        popup.addEventListener('focusin', Swal.stopTimer);
        popup.addEventListener('focusout', Swal.resumeTimer);
      },
    });
  }

  async function confirmRemoval(title, text) {
    const result = await Swal.fire({
      titleText: title, text, icon: 'warning', showCancelButton: true, focusCancel: true,
      confirmButtonText: 'Hapus', cancelButtonText: 'Batal', confirmButtonColor: '#b91c1c',
    });
    return result.isConfirmed;
  }

  global.IwomsUI = {
    dataTable: { mounted: mountTable, updated(host, binding) { releaseTable(host); mountTable(host, binding); }, beforeUnmount: releaseTable },
    notify, confirmRemoval,
  };
})(window);
