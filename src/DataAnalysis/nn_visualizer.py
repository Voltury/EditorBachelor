from autoencoder import Autoencoder
from classifier import Classifier
import torch
from torchsummary import summary

autoencoder = Autoencoder()

classifier = Classifier(autoencoder.encoder)

# Summary of the classifier
summary(classifier, (1, 1080, 1920))
