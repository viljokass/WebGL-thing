// Some vector mathematics functions, for calculating some necessary matrices.

// Identity matrix

export function identity() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

// Translation matrix
export function translation(tx, ty, tz) {
  return [
    1,  0,  0, tx,
    0,  1,  0, ty,
    0,  0,  1, tz,
    0,  0,  0,  1,
  ];
}

// Scaling matrix
export function scale(sx, sy, sz) {
  return [
    sx,  0,  0,  0,
     0, sy,  0,  0,
     0,  0, sz,  0,
     0,  0,  0,  1,
  ];
}

// Rotation matrix in respect to x-axis
export function x_rotation(theta) {

  // Calculate sine and cosine of the input angle
  const s = Math.sin(theta);
  const c = Math.cos(theta);

  // Construct and return the matrix
  return [
    1,  0,  0,  0,
    0,  c, -s,  0,
    0,  s,  c,  0,
    0,  0,  0,  1,
  ];
}

// Rotation matrix in respect to y-axis
export function y_rotation(theta) {

  // Calculate the sine and cosine of the input angle
  const s = Math.sin(theta);
  const c = Math.cos(theta);

  // Construct and return the matrix
  return [
    c,  0,  s,  0,
    0,  1,  0,  0,
   -s,  0,  c,  0,
    0,  0,  0,  1,
  ];
}

// Rotation matrix in respect to z-axis
export function z_rotation(theta) {

  // Calculate the sine and cosine of the input angle
  const s = Math.sin(theta);
  const c = Math.cos(theta);

  // Construct and return the matrix
  return [
    c, -s,  0,  0,
    s,  c,  0,  0,
    0,  0,  1,  0,
    0,  0,  0,  1,
  ];
}

// Perspective matrix
export function perspective(fov, aspect, near, far) {
  const a11 = 1/(aspect * Math.tan(fov/2));
  const a22 = 1/(Math.tan(fov/2));
  const a33 = -((far+near)/far-near);
  const a34 = -((2 * far * near)/(far-near));
  return [
  a11,  0,  0,  0,
    0,a22,  0,  0,
    0,  0,a33, a34,
    0,  0, -1,  0,
  ];
}

// Matrix multiplication of two 4x4 matrices
export function mat4multiply(a, b) {

  // Construct the matrix
  const out = [];
  for (let i = 0; i < 16; i += 4) {
    for (let j = 0; j < 4; j++) {
      out[i+j] = a[i]*b[j] + a[i+1]*b[4+j] + a[i+2]*b[8+j] + a[i+3]*b[12+j];
    }
  }

  // Return the matrix
  return out;
}

// Addition of two 3D-vectors.
export function vec3add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

// Subtraction of two 3D-vectors.
export function vec3subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

// Normalization of a 3D vector
export function vec3normalize(a) {
  const a0 = a[0];
  const a1 = a[1];
  const a2 = a[2];
  const l = Math.sqrt(a0*a0 + a1*a1 + a2*a2);
  return a.map((x)=>x/l);
}

// Calculates the dot product of two 3D-vectors
export function vec3dotProduct(a, b) {
  let dotProd = 0;
  for (let i = 0; i < 3; i++) {
    dotProd += a[i]*b[i];
  }
  return dotProd;
}

// Calculates the cross product of two 3D-vectors
export function vec3crossProduct(a, b) {
  // Constants for our calculations
  const a0 = a[0];
  const a1 = a[1];
  const a2 = a[2];
  const b0 = b[0];
  const b1 = b[1];
  const b2 = b[2];

  // You know, the cross product.
  return [a1*b2 - a2*b1, a2*b0 - a0*b2, a0*b1 - a1*b0];
}

// The famous lookAt matrix.
// INPUT: camera position, target position, and up vector.
export function lookAt(pos, target, up) {
  // Get the needed vectors
  // cd for camera direction, cr for camera right and cu for camera up
  const cd = vec3normalize(vec3subtract(pos, target));
  const cr = vec3normalize(vec3crossProduct(up, cd));
  const cu = vec3crossProduct(cd, cr);

  // Construct and return the matrix.
  const mat1 = [
    cr[0], cr[1], cr[2], 0,
    cu[0], cu[1], cu[2], 0,
    cd[0], cd[1], cd[2], 0,
        0,     0,     0, 1,
  ];

  const mat2 = [
          1,       0,       0,    -pos[0],
          0,       1,       0,    -pos[1],
          0,       0,       1,    -pos[2],
          0,       0,       0,    1,
  ];

  return mat4multiply(mat1, mat2);
}

// Transpose a 4x4 matrix
export function mat4transpose(a) { 
  return[
    a[0], a[4], a[8],  a[12],
    a[1], a[5], a[9],  a[13],
    a[2], a[6], a[10], a[14],
    a[3], a[7], a[11], a[15],
  ];
}

export function mat4copy(a) {
  let out = [];
  a.map((x)=>out.push(x));
  return out;
}



