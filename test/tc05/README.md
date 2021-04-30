
This test case covers the use of dynamically loaded functions.
The mapping makes use of the function `fooFunction` which adds the string `-foo` to the input string.

When *only* newly created functions are dynamically loaded, the RMLMapper fails to load default `idlab-fn` and `grel` functions.
Therefore this test case also contains a second function call to the `grel:string_contains` functions to cover this edge case.

For the test to succeed, both the newly created and default functions need to be explicitly provided.

The file `functions_all.nt` contains all functions needed as `fno` parameter for the javascript wrapper.
This file was created by combining all the functions of the `fno-descriptions` directory,
needed because if we add our own function description we also have to provide the default ones.

The folder `foo-function` contains the java source of the newly created `fooFunction` used for testing.
