import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap, throwError } from 'rxjs';
import { API_ROUTES } from '../constants/api-routes.constants';
import {
  Appointment,
  AppointmentListRequest,
  AppointmentTransition,
  CreateAppointmentRequest,
  UpdateAppointmentRequest
} from '../models/appointment.model';
import { ApiResult, Role } from '../models/auth.model';
import { ApiServiceFactory } from './api-service-factory';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly factory = inject(ApiServiceFactory);
  private readonly cache = new Map<number, Appointment>();

  private get baseUrl(): string {
    return this.factory.create(API_ROUTES.APPOINTMENTS.BASE).url;
  }

  list(request: AppointmentListRequest, role: Role): Observable<Appointment[]> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString())
      .set('status', request.status ?? '');

    if (request.startDate) {
      params = params.set('startDate', request.startDate);
    }
    if (request.endDate) {
      params = params.set('endDate', request.endDate);
    }

    const url = role === 'Doctor'
      ? this.factory.create(API_ROUTES.DOCTORS.MY_APPOINTMENTS).url
      : this.baseUrl;

    if (role !== 'Doctor') {
      params = params
        .set('doctorId', (request.doctorId ?? 0).toString())
        .set('patientId', (request.patientId ?? 0).toString())
        .set('specialtyId', (request.specialtyId ?? 0).toString());
    }

    return this.http.get<ApiResult<Appointment[]>>(url, { params }).pipe(
      map((result) => result.value ?? ([] as Appointment[])),
      tap((appointments) => appointments.forEach((appointment) => this.remember(appointment)))
    );
  }

  getForEdit(id: number, role: Role): Observable<Appointment> {
    const cached = this.cache.get(id);
    if (cached) {
      return of(cached);
    }

    return this.list({ pageNumber: 1, pageSize: 100 }, role).pipe(
      map((appointments) => appointments.find((appointment) => appointment.id === id)),
      map((appointment) => {
        if (!appointment) {
          throw new Error('Cita no encontrada');
        }
        return appointment;
      })
    );
  }

  create(request: CreateAppointmentRequest): Observable<ApiResult<Appointment>> {
    return this.http.post<ApiResult<Appointment>>(this.baseUrl, request);
  }

  update(id: number, request: UpdateAppointmentRequest): Observable<ApiResult<Appointment>> {
    const url = this.factory.create(API_ROUTES.APPOINTMENTS.BY_ID(id)).url;
    return this.http.put<ApiResult<Appointment>>(url, request);
  }

  transition(
    id: number,
    transition: AppointmentTransition
  ): Observable<ApiResult<Appointment>> {
    const route = this.transitionRoute(id, transition);
    if (!route) {
      return throwError(() => new Error('Transición de cita inválida'));
    }

    const url = this.factory.create(route).url;
    return this.http.patch<ApiResult<Appointment>>(url, {});
  }

  private transitionRoute(id: number, transition: AppointmentTransition): string | null {
    const routes: Record<AppointmentTransition, string> = {
      confirm: API_ROUTES.APPOINTMENTS.CONFIRM(id),
      start: API_ROUTES.APPOINTMENTS.START(id),
      finish: API_ROUTES.APPOINTMENTS.FINISH(id),
      'did-not-attend': API_ROUTES.APPOINTMENTS.DID_NOT_ATTEND(id),
      cancel: API_ROUTES.APPOINTMENTS.CANCEL(id)
    };

    return routes[transition] ?? null;
  }

  private remember(appointment: Appointment): void {
    this.cache.set(appointment.id, appointment);
  }
}
