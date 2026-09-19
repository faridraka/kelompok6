export class AppError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.status = status
  }
}

// export class NotFoundError extends AppError {
//   constructor(message = 'Data tidak ditemukan') {
//     super(message, 404)
//   }
// }

// export class ConflictError extends AppError {
//   constructor(message = 'Data sudah ada') {
//     super(message, 409)
//   }
// }
