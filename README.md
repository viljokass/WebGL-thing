# WebGL-thing
A thing made with WebGL. Just to mess around with it and learn it.

Some images that are not mine (they got in with the initial commit):
* Linkki Jyväskylä ry logo
* Earth map by JHT's planetary pixel emporium
* UV map form UV map wikipedia page


## About the thing

The thing has at least the following things.

* Texture mapping
* Specular mapping
* Shader operations have been abstracted to a separate class
* Drawables are implemented in a separate class

I've been thiking that the following features might be fun.

* Shadow mapping. As you can see, the above and below planes do not cast shadows on to each other or the back plane
* Normal mapping. Predefine tangent space for the vertices, thus not too complex shapes.
* Some predefined shapes, such as spheres. I have some ideas how to calculate vertices and normals for it.
* Model loading - I have ideas how to get the Utah teapot where the cube is now.

## Math

I've made a simple math library to calculate some necessary linear algebra.

Currently there's a few math things implemented:

* Rotation matrices (x,y,z)
* Scaling matrix
* Translation matrix
* Perspective matrix (In goes fov, aspect ratio, near and far planes, out comes the matrix)
* Multiplication of two 4x4 matrices
* Some vector math (addition, subtraction, normalization, dot and cross products)
* A LookAt matrix
