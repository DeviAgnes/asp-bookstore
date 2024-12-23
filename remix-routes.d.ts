declare module "remix-routes" {
  type URLSearchParamsInit = string | string[][] | Record<string, string> | URLSearchParams;
  // symbol won't be a key of SearchParams
  type IsSearchParams<T> = symbol extends keyof T ? false : true;
  
  type ExportedQuery<T> = IsSearchParams<T> extends true ? T : URLSearchParamsInit;
  

  export interface Routes {
  
    "": {
      params: never,
      query: ExportedQuery<import('app/routes/_auth+/_layout').SearchParams>,
    };
  
    "/": {
      params: never,
      query: ExportedQuery<import('app/root').SearchParams>,
    };
  
    "/admin": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/_index').SearchParams>,
    };
  
    "/admin/books": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/books+/_index').SearchParams>,
    };
  
    "/admin/genre": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/genre+/_index').SearchParams>,
    };
  
    "/admin/genre/:id/edit": {
      params: {
        id: string | number;
      } ,
      query: ExportedQuery<import('app/routes/admin+/genre+/$id.edit').SearchParams>,
    };
  
    "/admin/genre/new": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/genre+/new').SearchParams>,
    };
  
    "/admin/librarians": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/librarians+/_index').SearchParams>,
    };
  
    "/admin/librarians/:id/edit": {
      params: {
        id: string | number;
      } ,
      query: ExportedQuery<import('app/routes/admin+/librarians+/$id.edit').SearchParams>,
    };
  
    "/admin/librarians/new": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/librarians+/new').SearchParams>,
    };
  
    "/admin/libraries": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/libraries+/_index').SearchParams>,
    };
  
    "/admin/libraries/:id/edit": {
      params: {
        id: string | number;
      } ,
      query: ExportedQuery<import('app/routes/admin+/libraries+/$id.edit').SearchParams>,
    };
  
    "/admin/libraries/new": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/libraries+/new').SearchParams>,
    };
  
    "/admin/purchased-books": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/purchased-books').SearchParams>,
    };
  
    "/admin/rented-books": {
      params: never,
      query: ExportedQuery<import('app/routes/admin+/rented-books').SearchParams>,
    };
  
    "/books": {
      params: never,
      query: ExportedQuery<import('app/routes/_app+/books+/_index').SearchParams>,
    };
  
    "/books/:id/purchase": {
      params: {
        id: string | number;
      } ,
      query: ExportedQuery<import('app/routes/_app+/books+/$id.purchase').SearchParams>,
    };
  
    "/error": {
      params: never,
      query: ExportedQuery<import('app/routes/error').SearchParams>,
    };
  
    "/invoices": {
      params: never,
      query: ExportedQuery<import('app/routes/_app+/invoices').SearchParams>,
    };
  
    "/librarian": {
      params: never,
      query: ExportedQuery<import('app/routes/librarian+/_index').SearchParams>,
    };
  
    "/librarian/books": {
      params: never,
      query: ExportedQuery<import('app/routes/librarian+/books+/_index').SearchParams>,
    };
  
    "/librarian/books/:id/edit": {
      params: {
        id: string | number;
      } ,
      query: ExportedQuery<import('app/routes/librarian+/books+/$id.edit').SearchParams>,
    };
  
    "/librarian/books/new": {
      params: never,
      query: ExportedQuery<import('app/routes/librarian+/books+/new').SearchParams>,
    };
  
    "/librarian/purchased-books": {
      params: never,
      query: ExportedQuery<import('app/routes/librarian+/purchased-books').SearchParams>,
    };
  
    "/librarian/rented-books": {
      params: never,
      query: ExportedQuery<import('app/routes/librarian+/rented-books').SearchParams>,
    };
  
    "/login": {
      params: never,
      query: ExportedQuery<import('app/routes/_auth+/login').SearchParams>,
    };
  
    "/logout": {
      params: never,
      query: ExportedQuery<import('app/routes/_auth+/logout').SearchParams>,
    };
  
    "/purchased-books": {
      params: never,
      query: ExportedQuery<import('app/routes/_app+/purchased-books').SearchParams>,
    };
  
    "/register": {
      params: never,
      query: ExportedQuery<import('app/routes/_auth+/register').SearchParams>,
    };
  
    "/rented-books": {
      params: never,
      query: ExportedQuery<import('app/routes/_app+/rented-books').SearchParams>,
    };
  
    "/resources/delete-book": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/delete-book').SearchParams>,
    };
  
    "/resources/delete-genre": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/delete-genre').SearchParams>,
    };
  
    "/resources/delete-librarian": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/delete-librarian').SearchParams>,
    };
  
    "/resources/delete-library": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/delete-library').SearchParams>,
    };
  
    "/resources/edit-library": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/edit-library').SearchParams>,
    };
  
    "/resources/rent-book": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/rent-book').SearchParams>,
    };
  
    "/resources/rental-config": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/rental-config').SearchParams>,
    };
  
    "/resources/rental-payment": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/rental-payment').SearchParams>,
    };
  
    "/resources/view-invoice": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/view-invoice').SearchParams>,
    };
  
    "/resources/view-pdf": {
      params: never,
      query: ExportedQuery<import('app/routes/resources+/view-pdf').SearchParams>,
    };
  
  }

  type RoutesWithParams = Pick<
    Routes,
    {
      [K in keyof Routes]: Routes[K]["params"] extends Record<string, never> ? never : K
    }[keyof Routes]
  >;

  export type RouteId =
    | 'root'
    | 'routes/_app+/_index'
    | 'routes/_app+/_layout'
    | 'routes/_app+/books+/_index'
    | 'routes/_app+/books+/$id.purchase'
    | 'routes/_app+/invoices'
    | 'routes/_app+/purchased-books'
    | 'routes/_app+/rented-books'
    | 'routes/_auth+/_layout'
    | 'routes/_auth+/login'
    | 'routes/_auth+/logout'
    | 'routes/_auth+/register'
    | 'routes/admin+/_index'
    | 'routes/admin+/_layout'
    | 'routes/admin+/books+/_index'
    | 'routes/admin+/genre+/_index'
    | 'routes/admin+/genre+/$id.edit'
    | 'routes/admin+/genre+/new'
    | 'routes/admin+/librarians+/_index'
    | 'routes/admin+/librarians+/$id.edit'
    | 'routes/admin+/librarians+/new'
    | 'routes/admin+/libraries+/_index'
    | 'routes/admin+/libraries+/$id.edit'
    | 'routes/admin+/libraries+/new'
    | 'routes/admin+/purchased-books'
    | 'routes/admin+/rented-books'
    | 'routes/error'
    | 'routes/librarian+/_index'
    | 'routes/librarian+/_layout'
    | 'routes/librarian+/books+/_index'
    | 'routes/librarian+/books+/$id.edit'
    | 'routes/librarian+/books+/new'
    | 'routes/librarian+/purchased-books'
    | 'routes/librarian+/rented-books'
    | 'routes/resources+/delete-book'
    | 'routes/resources+/delete-genre'
    | 'routes/resources+/delete-librarian'
    | 'routes/resources+/delete-library'
    | 'routes/resources+/edit-library'
    | 'routes/resources+/rent-book'
    | 'routes/resources+/rental-config'
    | 'routes/resources+/rental-payment'
    | 'routes/resources+/view-invoice'
    | 'routes/resources+/view-pdf';

  export function $path<
    Route extends keyof Routes,
    Rest extends {
      params: Routes[Route]["params"];
      query?: Routes[Route]["query"];
    }
  >(
    ...args: Rest["params"] extends Record<string, never>
      ? [route: Route, query?: Rest["query"]]
      : [route: Route, params: Rest["params"], query?: Rest["query"]]
  ): string;

  export function $params<
    Route extends keyof RoutesWithParams,
    Params extends RoutesWithParams[Route]["params"]
  >(
      route: Route,
      params: { readonly [key: string]: string | undefined }
  ): {[K in keyof Params]: string};

  export function $routeId(routeId: RouteId): RouteId;
}