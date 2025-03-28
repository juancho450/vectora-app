import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { BankAccount } from '../interfaces/account.interface';
import { AccountsService } from '../services/account.service';

// Define el adaptador de entidad para cuentas bancarias
const accountsAdapter = createEntityAdapter<BankAccount>({
  selectId: (account: BankAccount) => account.id,
});

// Estado inicial
const initialState = accountsAdapter.getInitialState({
  loaded: false,
  loading: false,
  error: null as string | null,
  selectedAccountId: null as string | null,
});

// Tipo del estado
type AccountsState = typeof initialState;

// Crear el store de signals para cuentas
export const AccountsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, selectedAccountId, loading, error }) => {
    // Selectores computados
    return {
      accounts: computed(() => Object.values(entities()).filter(Boolean) as BankAccount[]),
      totalBalance: computed(() => 
        Object.values(entities())
          .filter((account): account is BankAccount => Boolean(account))
          .reduce((sum: number, account: BankAccount) => sum + account.balance, 0)
      ),
      selectedAccount: computed(() => {
        const id = selectedAccountId();
        return id ? entities()[id] || null : null;
      }),
      isLoading: computed(() => loading()),
      error: computed(() => error()),
    };
  }),
  withMethods((store) => {
    // Injectar el servicio
    const accountsService = inject(AccountsService);
    
    return {
      // Cargar todas las cuentas
      loadAccounts: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => 
            accountsService.getAccounts().pipe(
              map(accounts => {
                // Obtener estado actual y aplicar el adaptador
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedAccountId: store.selectedAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as AccountsState;
                
                const result = accountsAdapter.setAll(accounts, state);
                
                patchState(store, {
                  entities: result.entities,
                  ids: result.ids,
                  loaded: true,
                  loading: false,
                });
              }),
              catchError(error => {
                patchState(store, { 
                  error: error.message || 'Error al cargar las cuentas', 
                  loading: false 
                });
                return of(null);
              })
            )
          )
        )
      ),
      
      // Seleccionar una cuenta
      selectAccount: (id: string) => {
        patchState(store, { selectedAccountId: id });
      },
      
      // Crear una nueva cuenta
      createAccount: rxMethod<Omit<BankAccount, 'id'>>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(newAccount => 
            accountsService.createAccount(newAccount).pipe(
              map(account => {
                // Obtener estado actual y aplicar el adaptador
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedAccountId: store.selectedAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as AccountsState;
                
                const result = accountsAdapter.addOne(account, state);
                
                patchState(store, { entities: result.entities, ids: result.ids, loading: false });
              }),
              catchError(error => {
                patchState(store, {
                  error: error.message || 'Error al crear la cuenta',
                  loading: false
                });
                return of(null);
              })
            )
          )
        )
      ),
      
      // Actualizar una cuenta
      updateAccount: rxMethod<BankAccount>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(updatedAccount => 
            accountsService.updateAccount(updatedAccount).pipe(
              map(account => {
                // Obtener estado actual y aplicar el adaptador
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedAccountId: store.selectedAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as AccountsState;
                
                const result = accountsAdapter.updateOne(
                  { id: account.id, changes: account },
                  state
                );
                
                patchState(store, { entities: result.entities, ids: result.ids, loading: false });
              }),
              catchError(error => {
                patchState(store, {
                  error: error.message || 'Error al actualizar la cuenta',
                  loading: false
                });
                return of(null);
              })
            )
          )
        )
      ),
      
      // Eliminar una cuenta
      deleteAccount: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(id => 
            accountsService.deleteAccount(id).pipe(
              map(() => {
                // Obtener estado actual y aplicar el adaptador
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedAccountId: store.selectedAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as AccountsState;
                
                const result = accountsAdapter.removeOne(id, state);
                
                patchState(store, { 
                  entities: result.entities, 
                  ids: result.ids, 
                  loading: false,
                  selectedAccountId: store.selectedAccountId() === id ? null : store.selectedAccountId()
                });
              }),
              catchError(error => {
                patchState(store, {
                  error: error.message || 'Error al eliminar la cuenta',
                  loading: false
                });
                return of(null);
              })
            )
          )
        )
      )
    };
  })
);
