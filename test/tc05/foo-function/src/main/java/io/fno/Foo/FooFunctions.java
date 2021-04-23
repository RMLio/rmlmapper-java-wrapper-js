package io.fno.Foo;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;


public class FooFunctions {


    public static List<String> fooFunction(String text) {
        if (!text.equals("")) {
            try {
                return Arrays.asList(text + "-foo");
            } catch (Exception e) {
              System.err.println("Error");
            }
        }

        return new ArrayList<>();
    }
}
