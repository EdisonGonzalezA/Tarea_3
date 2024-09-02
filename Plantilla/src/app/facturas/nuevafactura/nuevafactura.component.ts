import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, Event, ActivatedRoute } from '@angular/router';
import { Icliente } from 'src/app/Interfaces/icliente';
import { IFactura } from 'src/app/Interfaces/ifactura';
import { ClientesService } from 'src/app/Services/clientes.service';
import { FacturaService } from 'src/app/Services/factura.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevafactura',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './nuevafactura.component.html',
  styleUrl: './nuevafactura.component.scss'
})
export class NuevafacturaComponent implements OnInit {
  //variables o constantes
  titulo = 'Nueva Factura';
  listaClientes: Icliente[] = [];
  listaClientesFiltrada: Icliente[] = [];
  totalapagar: number = 0;
  idFactura = 0;
  frm_factura: FormGroup;

  constructor(
    private clientesServicios: ClientesService,
    private facturaService: FacturaService,
    private navegacion: Router,
    private ruta: ActivatedRoute
  ) {}

  ngOnInit(): void {    
      this.frm_factura = new FormGroup({
        Fecha: new FormControl('', Validators.required),
        Sub_Total: new FormControl('', Validators.required),
        Sub_Total_IVA: new FormControl('', Validators.required),
        Valor_IVA: new FormControl('0.15', Validators.required),
        Cliente_idCliente: new FormControl('', Validators.required)
      });
    
  
      this.clientesServicios.todos().subscribe({
        next: (data) => {
          this.listaClientes = data;
          this.listaClientesFiltrada = data;
        },
        error: (e) => {
          console.log(e);
        }
      });

      this.idFactura = parseInt(this.ruta.snapshot.paramMap.get('id') || '0');  

      if (this.idFactura > 0) {
        this.cargar();
      }
  }

  cargar() {
    this.facturaService.uno(this.idFactura).subscribe((facturaN) => {
      this.frm_factura.patchValue({
        Fecha: facturaN.Fecha.split(" ")[0],
        Sub_Total: facturaN.Sub_Total,
        Sub_Total_IVA: facturaN.Sub_Total_IVA,
        Valor_IVA: facturaN.Valor_IVA,
        Cliente_idCliente: facturaN.Cliente_idCliente,
      });
      this.calculos();
      this.titulo = 'Editar Factura';
    });
  }

  grabar() {
    let factura: IFactura = {
      idFactura: this.idFactura,
      Fecha: this.frm_factura.get('Fecha')?.value,
      Sub_Total: this.frm_factura.get('Sub_Total')?.value,
      Sub_Total_IVA: this.frm_factura.get('Sub_Total_IVA')?.value,
      Valor_IVA: this.frm_factura.get('Valor_IVA')?.value,
      Cliente_idCliente: this.frm_factura.get('Cliente_idCliente')?.value
    };

        if (this.idFactura > 0) {
          this.facturaService.actualizar(factura).subscribe((respuesta) => {
            Swal.fire({
              title: 'Facturas',
              text: 'Factura actualizada.',
              icon: 'success'
            }).then(() => {
              this.navegacion.navigate(['/facturas']);
            });    
          });
        }else{
          this.facturaService.insertar(factura).subscribe((respuesta) => {
            Swal.fire({
              title: 'Facturas',
              text: 'La factura grabada.',
              icon: 'success'
            }).then(() => {
              this.navegacion.navigate(['/facturas']);    
            });        
          });
        }
  }
    calculos() {
    let sub_total = this.frm_factura.get('Sub_Total')?.value;
    let iva = this.frm_factura.get('Valor_IVA')?.value;
    let sub_total_iva = sub_total * iva;
    this.frm_factura.get('Sub_Total_IVA')?.setValue(sub_total_iva);
    this.totalapagar = parseInt(sub_total) + sub_total_iva;
  }

    cambio(objetoSlect: any) {
    let idClientes = objetoSlect.target.value;
    this.frm_factura.get('Cliente_idCliente')?.setValue(idClientes);
  }
}
