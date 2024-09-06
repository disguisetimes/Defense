export class Mat extends Array {
    constructor(dimension, values) {
        super();
        this.dimension = dimension;
        const nElements = dimension * dimension;
        for (let i = 0; i < nElements; ++i) {
            this.push(values ? values[i] : 0);
        }
    }
    static Identity(dimension) {
        const m = new Mat(dimension);
        for (let y = 0; y < dimension; ++y) {
            for (let x = 0; x < dimension; ++x) {
                m[y * dimension + x] = x == y ? 1 : 0;
            }
        }
        return m;
    }
    Mul(rhs) {
        if (typeof rhs == 'number')  {
            const m = new Mat(this.dimension);
            for (let i = 0; i < this.length; ++i) {
                m[i] = this[i] * rhs;
            }
            return m;
        }
        else {
            const m = new Mat(this.dimension);
            for (let i = 0; i < this.dimension; ++i) {
                for (let j = 0; j < this.dimension; ++j) {
                    for (let k = 0; k < this.dimension; ++k) {
                        m[j * this.dimension + i] += this[j * this.dimension + k] * rhs[k * this.dimension + i];
                    }
                }
            }
            return m;
        }
    }
}