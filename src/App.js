import React from "react";
import "./App.css";
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Spinner from "./Spinner";

// A theme with custom primary and secondary color.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#80e27e",
      main: "#4caf50",
      dark: "#087f23"
    },
    secondary: {
      light: "#80e27e",
      main: "#4caf50",
      dark: "#087f23"
    },
    type: "light"
  },
  typography: {
    fontFamily: [
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif"
    ].join(","),
    useNextVariants: true
  }
});

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  input: {
    display: "none"
  }
});

class App extends React.Component {
  state = {
    loading: false,
    error: false,
    prediction: "",
    probability: 0,
    file: null
  };

  // kiválasztunk/feltöltünk egy fotót és elküldi a modellnek, kapunk egy választ
  async handleUploadImage(e) {
    this.handleLoading(true);

    this.setState({
      file: URL.createObjectURL(e.target.files[0])
    });

    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      //itt küldi el a képet
      const response = await fetch(
        `https://southcentralus.api.cognitive.microsoft.com/customvision/v3.0/Prediction/0464c537-5626-446a-a2fe-3a5e6276952f/classify/iterations/Iteration2/image`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Prediction-Key": "",
            Accept: "application/json"
          }
        }
      );

      if (!response.ok) this.setState({ error: true });
      else {
        //ha van válasz, akkor json-ból átkonvertálja objektummá
        const result = await response.json();
        console.log(result);

        //megkeresi a legnagyobb valószínűségű predikciót
        const prediction = result.predictions.reduce((prev, current) =>
          prev.probability > current.probability ? prev : current
        );
        console.log(prediction);

        //állapotot állítunk be
        this.setState({
          prediction: prediction.tagName,
          probability: Math.round(prediction.probability * 100 * 100) / 100
        });
      }
    } catch (error) {
      console.log(error);
    }

    this.handleLoading(false);
  }

  handleLoading(on) {
    this.setState({
      loading: on
    });
  }

  render() {
    const { loading, prediction, probability, file } = this.state;
    const { classes } = this.props;

    //itt rendeleljük be az oldal tartalmát
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <div className="App-content">
            <Typography variant="h2" gutterBottom>
              Cash Detector
            </Typography>
            <Typography variant="h5" gutterBottom>
              Upload or make a picture with your camera
            </Typography>
            <input
              accept="image/*"
              className={classes.input}
              id="upload"
              type="file"
              onChange={e => this.handleUploadImage(e)}
            />
            <label htmlFor="upload">
              <Button
                variant="contained"
                color="primary"
                component="span"
                className={classes.button}
              >
                Upload
                <CloudUploadIcon className={classes.rightIcon} />
              </Button>
            </label>
            {loading ? (
              <Spinner />
            ) : prediction ? (
              <div>
                {prediction} ({probability}%)
              </div>
            ) : (
              ""
            )}
            {file ? <img width="200" alt="the uploaded" src={file} /> : ""}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
