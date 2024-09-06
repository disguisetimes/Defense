export class Vec extends Array {
    Add(rhs) {
        if (typeof rhs == 'number')  {
            return this.map((e, i) => e + rhs);
        }
        else {
            return this.map((e, i) => e + rhs[i]);
        }
    }
    Sub(rhs) {
        if (typeof rhs == 'number')  {
            return this.map((e, i) => e - rhs);
        }
        else {
            return this.map((e, i) => e - rhs[i]);
        }
    }
    Mul(rhs) {
        if (typeof rhs == 'number')  {
            return this.map((e, i) => e * rhs);
        }
        else {
            return this.map((e, i) => e * rhs[i]);
        }
    }    
    Div(rhs) {
        if (typeof rhs == 'number')  {
            return this.map((e, i) => e / rhs);
        }
        else {
            return this.map((e, i) => e / rhs[i]);
        }
    }
    Dot(rhs) {
        return this.Mul(rhs).reduce((sum, e) => sum + e, 0);
    }
    DotWithSelf() {
        return this.Dot(this);
    }
    Mag() {
        return Math.sqrt(this.Dot(this));
    }
    Normalize() {
        return this.Mul(1 / this.Mag());
    }
    Distance(rhs) {
        return Math.sqrt(this.Sub(rhs).DotWithSelf());
    }
    Min(rhs) {
        if (typeof rhs == 'number') {
            return this.map((e, i) => Math.min(e, rhs));
        }
        else {
            return this.map((e, i) => Math.min(e, rhs[i]));
        }
    }
    Max(rhs) {
        if (typeof rhs == 'number') {
            return this.map((e, i) => Math.max(e, rhs));
        }
        else {
            return this.map((e, i) => Math.max(e, rhs[i]));
        }
    }
    Fill(n, v) {
        const o = new Vec();
        for (let i = 0; i < n; ++i) {
            o.push(v);
        }
        return o;
    }
    Rotate2D(theta) {
        const tCos = Math.cos(theta);
        const tSin = Math.sin(theta);
        return new Vec(
            this[0] * tCos - this[1] * tSin,
            this[0] * tSin + this[1] * tCos
        );
    }
}