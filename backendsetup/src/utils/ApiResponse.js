class ApiResponse {
    constructor(StatusCode, data, message = "Success"){
        this.StatusCode = StatusCode
        this.data = data
        this.message = message
        this.success = StatusCode
    }
}

export {ApiResponse}