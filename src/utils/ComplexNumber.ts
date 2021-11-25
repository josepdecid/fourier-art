class ComplexNumber {
    r: number // Real term
    i: number // Imaginary term

    constructor(real: number, imaginary: number) {
        this.r = real
        this.i = imaginary
    }

    add(other: ComplexNumber): ComplexNumber {
        return new ComplexNumber(
            this.r + other.r,
            this.i + other.i
        )
    }

    subtract(other: ComplexNumber): ComplexNumber {
        return new ComplexNumber(
            this.r - other.r,
            this.i - other.i
        )
    }

    multiply(other: ComplexNumber): ComplexNumber {
        return new ComplexNumber(
            this.r * other.r - this.i * other.i,
            this.r * other.i + this.i * other.r
        )
    }

    divide(other: ComplexNumber): ComplexNumber {
        return new ComplexNumber(
            (this.r * other.r + this.i * other.i) / (other.r * other.r + other.i * other.i),
            (this.i * other.r - this.r * other.i) / (other.r * other.r + other.i * other.i)
        )
    }

    amplitude(): number {
        return Math.sqrt(this.r * this.r + this.i * this.i)
    }

    phase(): number {
        return Math.atan2(this.i, this.r)
    }
}

export default ComplexNumber